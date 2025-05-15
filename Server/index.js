
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Multer config: Store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// =================== Analyze X-ray (base64) ===================
app.post('/api/analyze-xray', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No X-ray image uploaded' });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: "system",
            content: "You are a medical diagnostic assistant specialized in radiology. Analyze X-ray images and provide professional findings in medical terminology. Be concise and focus on abnormalities, potential diagnoses, and recommended next steps."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Please analyze this X-ray image and provide a diagnostic report." },
              { type: "image_url", image_url: { url: base64Image } }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'Medical Diagnosis App'
        }
      }
    );

    res.json({
      report: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('X-ray Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze X-ray' });
  }
});

// =================== Medical Chat ===================
app.post('/api/medical-chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: "system",
            content: "You are a medical professional assisting doctors with diagnosis. Provide concise, professional answers using medical terminology. Focus on accuracy and clinical relevance."
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'Medical Diagnosis App'
        }
      }
    );

    res.json({
      message: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('Medical Chat Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to process medical query' });
  }
});

// =================== General Image Reader (base64) ===================
app.post('/api/read-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const { prompt } = req.body;
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: "system",
            content: "You are an intelligent visual assistant. You can analyze, describe, and interpret any image using natural language."
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt || "What’s in this image?" },
              { type: "image_url", image_url: { url: base64Image } }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'Image Reader AI'
        }
      }
    );

    res.json({
      description: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('Image Read Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Image reading failed' });
  }
});

// =================== Start Server ===================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
