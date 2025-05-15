require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const PORT = 3000;
let history = [];

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Image analysis using OpenRouter API
async function analyzeImage(imageUrl) {
  try {
    // Get the image file path from URL
    const imagePath = path.join(__dirname, imageUrl.replace(`http://localhost:${PORT}`, ''));
    
    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    
    // Call OpenRouter API for image analysis
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that helps students. Analyze images and provide useful information in a clear, engaging manner."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image and explain it in detail." },
              { type: "image_url", image_url: { url: base64Image } }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || 'sk-or-v1-9a4a1c2f5f9a4c2f9a4a1c2f5f9a4c2f9a4a1c2f5f9a4c2f'}`,
          'HTTP-Referer': `http://localhost:${PORT}`,
          'X-Title': 'Student WebMind',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error with image handling:", error);
    return "There was a problem analyzing the image. Please try again.";
  }
}

// Enhanced chat endpoint with improved response formatting
app.post('/chat', upload.single('image'), async (req, res) => {
  const message = req.body.message;
  let imageUrl = null;
  let imageAnalysis = null;

  if (req.file) {
    imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    imageAnalysis = await analyzeImage(imageUrl);
  }

  const userMessage = {
    role: 'user',
    content: message,
    ...(imageUrl && { 
      image: imageUrl,
      imageAnalysis: imageAnalysis 
    }),
  };

  history.push(userMessage);

  try {
    // Include image analysis in the message if available
    const combinedMessage = imageUrl 
      ? `${message}\n[Image Analysis: ${imageAnalysis}]`
      : message;

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small',
        messages: history.map(({ role, content, image, imageAnalysis }) => ({
          role,
          content: image ? `${content}\n[Image Analysis: ${imageAnalysis}]` : content
        })),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY || 'h4fxd9juHwPuRpXoqh2pTzMSxzBl0Vzy'}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const assistantReply = response.data.choices[0].message.content;

    history.push({ role: 'assistant', content: assistantReply });
    res.json({ 
      success: true,
      reply: assistantReply, 
      history,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('There was an error processing your request. Please try again later.');
  }
});


// Get conversation history
app.get('/history', (req, res) => {
  res.json({ 
    success: true,
    history,
    message: "Conversation history retrieved successfully"
  });
});

// Cleanup uploaded files periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  fs.readdir('uploads/', (err, files) => {
    if (err) return;
    files.forEach(file => {
      const filePath = path.join('uploads/', file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > oneHour) {
        fs.unlinkSync(filePath);
      }
    });
  });
}, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`✅ Student WebMind Server running successfully at http://localhost:${PORT}`);
  console.log(`📝 API Endpoints available:`);
  console.log(`   - POST /chat - Send messages and images`);
  console.log(`   - GET /history - View conversation history`);
});
