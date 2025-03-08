import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add export for GET method to handle preflight requests
export async function GET() {
  return NextResponse.json({ message: "API is working. Use POST to generate a startup idea." });
}

export async function POST(request: Request) {
  console.log("API route called with POST method");
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert AI designed to generate viral AI startup ideas for social media engagement. 
          Your task is to create creative, compelling, and Twitter-ready startup ideas that users can instantly share.
          The ideas should be simple, catchy, and intriguing enough to encourage discussion.
          
          IMPORTANT: Each time you are called, generate a COMPLETELY DIFFERENT and UNIQUE startup idea. 
          Never repeat previous ideas. Be extremely creative and innovative.`
        },
        {
          role: "user",
          content: `Generate a BRAND NEW AI-powered startup idea with:
          1. A short, brandable, and creative name (e.g., "SynthSync AI").
          2. A one-sentence pitch explaining what the AI startup does (e.g., "AI that books meetings before you even know you need them.").
          3. A Twitter-ready text that includes the startup name, tagline, and a call-to-action.
          
          Format your response as a JSON object with the following structure:
          {
            "name": "Startup Name",
            "tagline": "One-sentence pitch",
            "tweet": "Pre-written tweet text that includes the name, tagline, and mentions @VibeShipAI and vibeship.ai"
          }
          
          Constraints:  
          - Keep the tweet under 280 characters.  
          - Use an engaging, casual, and thought-provoking tone.  
          - Avoid technical jargon—make it simple and easy to grasp at a glance.
          - Make sure the idea is COMPLETELY DIFFERENT from common ideas like dream interpretation, email management, or content creation.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 1.0,
    });

    // Parse the JSON response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("No content in OpenAI response");
      return NextResponse.json({ error: "No content in response" }, { status: 500 });
    }

    const parsedContent = JSON.parse(content);
    console.log("Generated startup idea:", parsedContent);
    
    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("Error generating startup idea:", error);
    return NextResponse.json({ error: "Failed to generate startup idea", details: String(error) }, { status: 500 });
  }
} 