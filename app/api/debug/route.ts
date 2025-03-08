import { NextResponse } from 'next/server';

export async function GET() {
  // Check if OpenAI API key is set (don't show the actual key for security)
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  
  // Get the first few characters of the key for verification (if it exists)
  const keyPrefix = hasOpenAIKey ? 
    `${process.env.OPENAI_API_KEY?.substring(0, 7)}...` : 
    'not set';
  
  // Return environment information
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    openai_key_set: hasOpenAIKey,
    openai_key_prefix: keyPrefix,
    vercel_environment: process.env.VERCEL_ENV || 'not set',
    timestamp: new Date().toISOString()
  });
} 