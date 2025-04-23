import { HfInference } from '@huggingface/inference';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: `You are a financial advisor providing clear, actionable advice on financial topics. Your goal is to offer practical steps, relevant examples, and strategic insights, ensuring the explanation is accessible and useful for individuals with varying levels of understanding. Keep the response concise, around 300 words, and present the information seamlessly without categorizing it into separate levels. Focus on delivering a cohesive and unified explanation that addresses the user's question effectively.`,
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function getEmbedding(text) {
  const response = await hf.featureExtraction({
    model: 'sentence-transformers/all-mpnet-base-v2',
    inputs: text,
  });
  return response;
}

async function retrieveDocument(embedding) {
  try {
    const { data, error } = await supabase
      .rpc('match_documents', {
        query_embedding: embedding,
        filter: {},
      });

    if (error) {
      console.error('Error retrieving document:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error in retrieveDocument:', error);
    return null;
  }
}

async function generateAnswer(question, document) {
  const prompt = `
You are a financial advisor skilled at providing comprehensive, easy-to-understand answers tailored to users. Your goal is to address questions effectively by giving response, using simple terms, practical examples, and insights when necessary. Focus on clarity, and present the answer in structured bullet points for better readability and understanding and also refer the below question and document context.

**Question:** ${question}

**Document Context:** ${document.content}

**Answer:**
`;

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  };

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(prompt);

  return result.response.text();
}

async function answerQuestion(question) {
  try {
    const embedding = await getEmbedding(question);
    const document = await retrieveDocument(embedding);
    if (!document) {
      throw new Error('No relevant document found.');
    }
    const answer = await generateAnswer(question, document);
    return answer;
  } catch (error) {
    console.error('Error answering question:', error);
    return 'Sorry, I could not generate an answer.';
  }
}

export { answerQuestion };