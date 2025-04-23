import express from 'express';
import { answerQuestion } from '../controllers/chatbot.controller.js';

const router = express.Router();

router.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const answer = await answerQuestion(question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;