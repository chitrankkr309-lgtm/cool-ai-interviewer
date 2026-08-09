import { GoogleGenAI, Type } from '@google/genai';
import { NextResponse } from 'next/server';

// Initialize the GenAI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, difficulty, conversationHistory } = body;

    if (!topic || !conversationHistory) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Define the System Instructions
    const systemInstruction = `You are an expert technical interviewer conducting a dynamic, multi-turn interview.
Topic: ${topic}
Difficulty: ${difficulty}

Interview Rules:
1. Read the provided conversation history carefully.
2. Evaluate the candidate's latest response internally.
3. If the candidate's answer is weak or incomplete, set action to 'ASK_FOLLOW_UP' and provide a probing question to test their depth.
4. If the answer is good, set action to 'ASK_NEW_QUESTION' and move to the next related concept.
5. Once the conversation reaches roughly 5-7 interactions, or if you have enough data to make a hiring decision, set action to 'FINISH_INTERVIEW'.
6. If finishing the interview, you MUST set is_interview_complete to true and provide the complete hiring_report. Otherwise, is_interview_complete must be false.`;

    // 2. Define the strict JSON response schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        internal_evaluation: {
          type: Type.STRING,
          description: "Brief internal analysis of the candidate's most recent answer.",
        },
        action: {
          type: Type.STRING,
          description: "The next state of the interview.",
          enum: ["ASK_FOLLOW_UP", "ASK_NEW_QUESTION", "FINISH_INTERVIEW"],
        },
        next_question: {
          type: Type.STRING,
          description: "The question to ask the candidate next. Set to null if finishing the interview.",
          nullable: true,
        },
        is_interview_complete: {
          type: Type.BOOLEAN,
          description: "True if the interview is over, false otherwise.",
        },
        hiring_report: {
          type: Type.OBJECT,
          nullable: true,
          description: "Only provide this object if is_interview_complete is true.",
          properties: {
            technical_score: { type: Type.NUMBER, description: "Score out of 100" },
            communication_score: { type: Type.NUMBER, description: "Score out of 100" },
            confidence_score: { type: Type.NUMBER, description: "Score out of 100" },
            detailed_feedback: { type: Type.STRING, description: "A detailed summary of the candidate's overall performance." },
          },
        },
      },
      required: ["internal_evaluation", "action", "is_interview_complete"],
    };

    // 3. Format the conversation history
    const formattedHistory = conversationHistory.map((msg: any) => 
      `${msg.role.toUpperCase()}: ${msg.text}`
    ).join('\n\n');

    const prompt = `Here is the conversation history so far:\n\n${formattedHistory || "No history yet. Start the interview."}\n\nBased on your instructions, generate the next interview step.`;

    // 4. Call the Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error("No response generated from Gemini");
    }

    // 5. Robust JSON Parsing (Fix for formatting bugs)
    let rawText = response.text;
    // Strip out markdown code blocks if Gemini accidentally adds them
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(rawText);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Interview Agent API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process interview step" }, { status: 500 });
  }
}