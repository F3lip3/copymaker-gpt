// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, CreateCompletionResponse, OpenAIApi } from 'openai';
import { z } from 'zod';

export type OpenAIResponse = {
  text?: string;
  error?: string;
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const InputData = z.object({
  prompt: z.string()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateCompletionResponse | OpenAIResponse>
) {
  const data = InputData.parse(req.body);
  if (!data.prompt) {
    return res.status(400).json({
      error: 'No question provided!'
    });
  }

  const result = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: data.prompt,
    temperature: 0.6,
    max_tokens: 2048
  });

  let formattedText = result.data?.choices?.[0]?.text;
  if (formattedText?.startsWith('\n\n'))
    formattedText = formattedText.substring(2);

  res.status(200).json({
    text: formattedText
  });
}
