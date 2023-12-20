import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import express, { Request, Response } from 'express';

dotenv.config();
const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

app.post('/stream', async (req: Request, res: Response) => {
  try {
    const messages = [
      {
        role: 'user',
        content: 'You are a remarkable quantum mechanics professor.',
      },
      {
        role: 'assistant',
        content:
          'I am thrilled to teach you about the true nature of the universe!',
      },
      {
        role: 'user',
        content:
          'Teach me about the movement of the electron around the nucleus.',
      },
    ] as OpenAI.Chat.ChatCompletionMessage[];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      max_tokens: 2000,
      messages,
    });

    res.status(200).json({ completion });
  } catch (error) {
    res.status(500).json({ error: 'Error processing your request' });
  }
});

export default app;
