import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import cors from 'cors';
import express, { Request, Response } from 'express';

dotenv.config();

const app = express();
app.use(cors());
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
          'Teach me about the movement of the electron around the nucleus in a simple way with few words.',
      },
    ] as OpenAI.Chat.ChatCompletionMessage[];

    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      max_tokens: 2000,
      messages,
      stream: true,
    });

    // Set the headers to enable SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      res.write(content);
      //process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }

    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Error processing your request' });
  }
});

export default app;
