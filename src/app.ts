import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import cors from 'cors';
import express, { Request, Response } from 'express';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

app.options('*', cors());

app.post('/stream', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const prompt =
      payload.prompt ||
      'Teach me about the movement of the electron around the nucleus in a simple way with few words.';

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
        content: `${prompt}.
          If you receive a question not related to quantum mechanics or physics,
          then you should advise about your abilities to only answer questions related to quantum mechanics
          and then ask for a new question related to this topic.`,
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

    const chunks = [];

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';

      if (payload.stream) {
        res.write(content);
      } else {
        chunks.push(content);
      }
    }

    if (payload.stream) {
      res.end();
    } else {
      res.json(chunks);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error processing your request' });
  }
});

app.post('/audio', async (req: Request, res: Response) => {
  const audio = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: 'Hello world! This is a streaming test.',
  });

  const buffer = Buffer.from(await audio.arrayBuffer());

  // Convert the audio data to a Base64 string
  const base64String = (buffer as Buffer).toString('base64');

  // Set the headers to enable SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send the Base64 string as an SSE message
  res.write(base64String);

  // End the SSE stream
  res.end();
});

app.post('/stream-audio', async (req: Request, res: Response) => {
  const payload = req.body;

  const prompt =
    payload.prompt ||
    'Teach me about the movement of the electron around the nucleus in a simple way with few words.';

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
      content: `${prompt}.
          If you receive a question not related to quantum mechanics or physics,
          then you should advise about your abilities to only answer questions related to quantum mechanics
          and then ask for a new question related to this topic.`,
    },
  ] as OpenAI.Chat.ChatCompletionMessage[];

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    max_tokens: 2000,
    messages,
    stream: true,
  });

  const chunks = [];

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';

    chunks.push(content);
  }

  const audio = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: chunks.join(' '),
  });

  const buffer = Buffer.from(await audio.arrayBuffer());

  // Convert the audio data to a Base64 string
  const base64String = (buffer as Buffer).toString('base64');

  res.json([
    { type: 'text', content: chunks },
    { type: 'audio', content: base64String },
  ]);
});

app.post('/real-time', async (req: Request, res: Response) => {
  const payload = req.body;

  const prompt =
    payload.prompt ||
    'Teach me about the movement of the electron around the nucleus in a simple way with few words.';

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
      content: `${prompt}.
          If you receive a question not related to quantum mechanics or physics,
          then you should advise about your abilities to only answer questions related to quantum mechanics
          and then ask for a new question related to this topic.`,
    },
  ] as OpenAI.Chat.ChatCompletionMessage[];

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    max_tokens: 2000,
    messages,
    stream: true,
  });

  const chunks = [];

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';

    chunks.push(content);
  }

  const audio = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: chunks.join(' '),
  });

  // const audio = await openai.audio.speech.create({
  //   model: 'tts-1',
  //   voice: 'alloy',
  //   input: 'Hello world! This is a streaming test.',
  // });

  const audioBuffer = Buffer.from(await audio.arrayBuffer());

  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : audioBuffer.length - 1;

    const chunk = audioBuffer.slice(start, end + 1);
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${audioBuffer.length}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunk.length,
      'Content-Type': 'audio/mp3',
    });
    res.end(chunk);
  } else {
    res.writeHead(200, {
      'Content-Length': audioBuffer.length,
      'Content-Type': 'audio/mp3',
    });
    res.end(audioBuffer);
  }
});

export default app;
