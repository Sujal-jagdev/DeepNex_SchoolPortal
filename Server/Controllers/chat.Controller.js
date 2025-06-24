const axios = require("axios");
const path = require("path");
const fs = require("fs");
const supabaseModel = require("../Models/supabaseModel");
const { v4: uuidv4 } = require("uuid");

/**
 * Analyze image using OpenRouter API
 * @param {string} imageUrl - URL of the image to analyze
 * @param {number} port - Server port for URL construction
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string>} - Analysis result
 */
async function analyzeImage(imageUrl, port, apiKey) {
  try {
    // Get the image file path from URL
    const imagePath = path.join(
      __dirname,
      "..",
      imageUrl.replace(`http://localhost:${port}`, "")
    );

    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString(
      "base64"
    )}`;

    // Call OpenRouter API for image analysis
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that helps students. Analyze images and provide useful information in a clear, engaging manner.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image and explain it in detail.",
              },
              { type: "image_url", image_url: { url: base64Image } },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${
            apiKey ||
            "sk-or-v1-9a4a1c2f5f9a4c2f9a4a1c2f5f9a4c2f9a4a1c2f5f9a4c2f"
          }`,
          "HTTP-Referer": `http://localhost:${port}`,
          "X-Title": "Student WebMind",
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error with image handling:", error);
    return "There was a problem analyzing the image. Please try again.";
  }
}

/**
 * Handle student chat messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.studentChat = async (req, res) => {
  const message = req.body.message;
  const sessionId = req.body.sessionId;
  const userId = req.body.userId;
  const PORT = process.env.PORT || 5000;
  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
  const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  let imageUrl = null;
  let imageAnalysis = null;
  let currentSessionId = sessionId;

  try {
    // If no session ID is provided, create a new session
    if (!currentSessionId) {
      const sessionData = {
        user_id: userId || null,
        session_title:
          message.substring(0, 50) + (message.length > 50 ? "..." : ""),
      };

      const { data: newSession, error: sessionError } =
        await supabaseModel.createChatSession(sessionData);

      if (sessionError) {
        throw new Error(
          `Failed to create chat session: ${sessionError.message}`
        );
      }

      currentSessionId = newSession[0].id;
    }

    // Process image if provided
    if (req.file) {
      imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
      imageAnalysis = await analyzeImage(imageUrl, PORT, OPENROUTER_API_KEY);
    }

    // Save user message to database
    const userMessageData = {
      session_id: currentSessionId,
      sender_role: "user",
      content: message,
      ...(imageUrl && {
        content: JSON.stringify({
          text: message,
          image: imageUrl,
          imageAnalysis: imageAnalysis,
        }),
      }),
    };

    const { error: userMsgError } = await supabaseModel.saveChatMessage(
      userMessageData
    );

    if (userMsgError) {
      throw new Error(`Failed to save user message: ${userMsgError.message}`);
    }

    // Update message count for student if userId is provided
    if (userId) {
      try {
        // First get the current message count
        const { data: studentData, error: studentError } =
          await supabaseModel.getStudents();

        // Find the student with matching ID
        const student = studentData
          ? studentData.find((s) => s.id === userId)
          : null;

        if (studentError || !student) {
          console.error(
            `Error fetching student data: ${
              studentError ? studentError.message : "Student not found"
            }`
          );
        } else {
          // Increment message count
          const currentCount = student.message_count || 0;
          const newCount = currentCount + 1;

          // Update student's message count
          const { error: updateError } = await supabaseModel.updateStudent(
            userId,
            { message_count: newCount }
          );

          if (updateError) {
            console.error(
              `Error updating message count: ${updateError.message}`
            );
          }
        }
      } catch (countError) {
        console.error(
          `Exception updating message count: ${countError.message}`
        );
        // Continue with chat processing even if count update fails
      }
    }

    // Get all messages for this session to maintain conversation context
    const { data: chatHistory, error: historyError } =
      await supabaseModel.getChatHistory(currentSessionId);

    if (historyError) {
      throw new Error(
        `Failed to retrieve chat history: ${historyError.message}`
      );
    }

    // Format messages for the AI API with student-specific system prompt
    const studentSystemPrompt = `
You are a school teacher teaching students from 5th to 10th standard.
Speak in Hinglish and behave like a real teacher.
Always address students using words like "beta", "son", "shabash".

Never mention anything about being an AI. Adjust your teaching style based on the subject:

- For Maths: Give formula-based, logical, no-story explanation.
- For Science/Geography/History: Use short stories, examples, and real-life connections.
- For English: Use examples, sentence-building exercises, and playful tone.

Maintain a warm, encouraging tone but correct the student gently where needed.

IMPORTANT RULES:
1. ONLY respond to what the student has specifically asked. Do not introduce new topics or questions they haven't asked about.
2. If the student just says "Hello" or similar greetings, respond with a simple greeting and ask how you can help them with their studies today.
3. Do not automatically start giving math problems or questions unless the student specifically asks for them.
4. Keep your responses concise and relevant to the student's query.
5. Wait for the student to specify which subject they need help with before providing subject-specific content.
`;

    const formattedMessages = [
      { role: "system", content: studentSystemPrompt },
      ...chatHistory.map((msg) => {
        if (msg.sender_role === "user" && msg.content.includes("imageAnalysis")) {
          try {
            const parsedContent = JSON.parse(msg.content);
            return {
              role: msg.sender_role,
              content: `${parsedContent.text}\n[Image Analysis: ${parsedContent.imageAnalysis}]`,
            };
          } catch (e) {
            return { role: msg.sender_role, content: msg.content };
          }
        } else {
          return { role: msg.sender_role, content: msg.content };
        }
      })
    ];

    // Call Mistral API
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: "mistral-small",
        messages: formattedMessages,
      },
      {
        headers: {
          Authorization: `Bearer ${
            MISTRAL_API_KEY || "h4fxd9juHwPuRpXoqh2pTzMSxzBl0Vzy"
          }`,
          "Content-Type": "application/json",
        },
      }
    );

    const assistantReply = response.data.choices[0].message.content;

    // Save assistant's reply to database
    const assistantMessageData = {
      session_id: currentSessionId,
      sender_role: "assistant",
      content: assistantReply,
      response_to: userMessageData.id, // Link to the message it's responding to
    };

    const { error: assistantMsgError } = await supabaseModel.saveChatMessage(
      assistantMessageData
    );

    if (assistantMsgError) {
      throw new Error(
        `Failed to save assistant message: ${assistantMsgError.message}`
      );
    }

    // Get updated chat history
    const { data: updatedHistory, error: updatedHistoryError } =
      await supabaseModel.getChatHistory(currentSessionId);

    if (updatedHistoryError) {
      throw new Error(
        `Failed to retrieve updated chat history: ${updatedHistoryError.message}`
      );
    }

    res.json({
      success: true,
      reply: assistantReply,
      history: updatedHistory,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message:
        "There was an error processing your request. Please try again later.",
      error: err.message,
    });
  }
};

/**
 * Get student chat history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getStudentChatHistory = async (req, res) => {
  try {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
      // If no session ID is provided, return all sessions for the user
      const userId = req.query.userId;
      const { data: sessions, error: sessionsError } =
        await supabaseModel.getChatSessions(userId);

      if (sessionsError) {
        throw new Error(
          `Failed to retrieve chat sessions: ${sessionsError.message}`
        );
      }

      res.json({
        success: true,
        sessions: sessions,
        message: "Chat sessions retrieved successfully",
      });
    } else {
      // If session ID is provided, return chat history for that session
      const { data: history, error: historyError } =
        await supabaseModel.getChatHistory(sessionId);

      if (historyError) {
        throw new Error(
          `Failed to retrieve chat history: ${historyError.message}`
        );
      }

      res.json({
        success: true,
        history: history,
        message: "Conversation history retrieved successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve chat history",
      error: err.message,
    });
  }
};

/**
 * Handle teacher chat messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.teacherChat = async (req, res) => {
  try {
    const userMessage = req.body.message;
    const sessionId = req.body.sessionId;
    const userId = req.body.userId;
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
    const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
    let currentSessionId = sessionId;

    // If no session ID is provided, create a new session
    if (!currentSessionId) {
      const sessionData = {
        user_id: userId || null,
        session_title:
          userMessage.substring(0, 50) + (userMessage.length > 50 ? "..." : ""),
      };

      const { data: newSession, error: sessionError } =
        await supabaseModel.createChatSession(sessionData);

      if (sessionError) {
        throw new Error(
          `Failed to create chat session: ${sessionError.message}`
        );
      }

      currentSessionId = newSession[0].id;
    }

    // Save user message to database
    const userMessageData = {
      session_id: currentSessionId,
      sender_role: "user",
      content: userMessage,
    };

    const { data: savedUserMsg, error: userMsgError } =
      await supabaseModel.saveChatMessage(userMessageData);

    if (userMsgError) {
      throw new Error(`Failed to save user message: ${userMsgError.message}`);
    }

    // Get all messages for this session to maintain conversation context
    const { data: chatHistory, error: historyError } =
      await supabaseModel.getChatHistory(currentSessionId);

    if (historyError) {
      throw new Error(
        `Failed to retrieve chat history: ${historyError.message}`
      );
    }

    // Format messages for the AI API
    const systemPrompt = `
You are a teacher's partner – a friendly staffroom buddy.
Speak in Hinglish like two teachers chatting during free period.
Help them plan lessons, brainstorm ideas, and solve doubts.

When the teacher provides enough information about what they need, respond in a helpful, fun, creative tone — using words like "Arre haan", "Mast idea hai", "Chalo sochte hain".

Use content style based on class level:
- For Class 1–5: Basic words, visual aids, rhymes, simple characters.
- For Class 6–8: Relatable stories, fun challenges, games, group tasks.
- For Class 9–10: Concept depth, logic reasoning, case studies, research angles.

IMPORTANT RULES:
1. If the teacher just says "Hello" or similar greetings, respond with a simple friendly greeting and ask how you can help them with their teaching today. Do not ask multiple questions in your initial response.
2. Only when the teacher asks for specific help with lesson planning or teaching, then you can politely ask for:
   - Standard (Grade/Class)?
   - Subject?
   - Concept?
3. ONLY respond to what the teacher has specifically asked. Do not introduce new topics they haven't asked about.
4. Keep your responses concise and relevant to the teacher's query.
5. Never say you're an AI or assistant.
`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((msg) => ({
        role: msg.sender_role,
        content: msg.content,
      })),
    ];

    // Call Mistral API
    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: "mistral-small-latest",
        messages: formattedMessages,
      },
      {
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    // Save assistant's reply to database
    const assistantMessageData = {
      session_id: currentSessionId,
      sender_role: "assistant",
      content: aiResponse,
      response_to: savedUserMsg[0].id, // Link to the message it's responding to
    };

    const { error: assistantMsgError } = await supabaseModel.saveChatMessage(
      assistantMessageData
    );

    if (assistantMsgError) {
      throw new Error(
        `Failed to save assistant message: ${assistantMsgError.message}`
      );
    }

    // Get updated chat history
    const { data: updatedHistory, error: updatedHistoryError } =
      await supabaseModel.getChatHistory(currentSessionId);

    if (updatedHistoryError) {
      throw new Error(
        `Failed to retrieve updated chat history: ${updatedHistoryError.message}`
      );
    }

    res.json({
      success: true,
      history: updatedHistory,
      reply: aiResponse,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error("Error processing teacher chat:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process message",
      message: error.message,
    });
  }
};

/**
 * Get teacher chat history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTeacherChatHistory = async (req, res) => {
  try {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
      // If no session ID is provided, return all sessions for the user
      const userId = req.query.userId;
      const { data: sessions, error: sessionsError } =
        await supabaseModel.getChatSessions(userId);

      if (sessionsError) {
        throw new Error(
          `Failed to retrieve chat sessions: ${sessionsError.message}`
        );
      }

      res.json({
        success: true,
        sessions: sessions,
        message: "Teacher chat sessions retrieved successfully",
      });
    } else {
      // If session ID is provided, return chat history for that session
      const { data: history, error: historyError } =
        await supabaseModel.getChatHistory(sessionId);

      if (historyError) {
        throw new Error(
          `Failed to retrieve chat history: ${historyError.message}`
        );
      }

      res.json({
        success: true,
        history: history,
        message: "Teacher conversation history retrieved successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve teacher chat history",
      error: err.message,
    });
  }
};

/**
 * Clear student chat history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.clearStudentChatHistory = async (req, res) => {
  try {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required to clear chat history",
      });
    }

    const { error } = await supabaseModel.clearChatHistory(sessionId);

    if (error) {
      throw new Error(`Failed to clear chat history: ${error.message}`);
    }

    res.json({
      success: true,
      message: "Student conversation history cleared successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to clear student chat history",
      error: err.message,
    });
  }
};

/**
 * Clear teacher chat history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.clearTeacherChatHistory = async (req, res) => {
  try {
    const sessionId = req.query.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required to clear chat history",
      });
    }

    const { error } = await supabaseModel.clearChatHistory(sessionId);

    if (error) {
      throw new Error(`Failed to clear chat history: ${error.message}`);
    }

    res.json({
      success: true,
      message: "Teacher conversation history cleared successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to clear teacher chat history",
      error: err.message,
    });
  }
};
