const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const MISTRAL_API_KEY = 'h4fxd9juHwPuRpXoqh2pTzMSxzBl0Vzy';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

let chatHistory = [];

app.post('/teacher-chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    // Add user message to history
    chatHistory.push({
      role: 'user',
      content: userMessage
    });
    
    // Call Mistral API
    const response = await axios.post(MISTRAL_API_URL, {
      model: 'mistral-tiny',
      messages: chatHistory
    }, {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const aiResponse = response.data.choices[0].message.content;
    
    // Add AI response to history
    chatHistory.push({
      role: 'assistant',
      content: aiResponse
    });
    
    res.json({ history: chatHistory });
    
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Teacher server running on port ${PORT}`);
});