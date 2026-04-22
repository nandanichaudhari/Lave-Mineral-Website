// src/app/api/generate-label/route.ts
// Get FREE API key at: https://aistudio.google.com/app/apikey
// Add to .env.local:  GEMINI_API_KEY=your_key_here

import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a water bottle label designer. Output ONLY a raw JSON array with exactly 3 objects. No markdown, no explanation, no code fences. Start with [ end with ].

Each object has exactly these fields:
{"name":"string","background":"#hexcolor","elements":[...]}

Each design has EXACTLY 4 elements in this order:

Element 1 - background rect (always same structure):
{"id":"e1","type":"rect","x":20,"y":20,"width":460,"height":560,"fill":"#hexcolor","stroke":"#hexcolor","strokeWidth":2,"rotation":0,"opacity":1,"draggable":true}

Element 2 - brand name text:
{"id":"e2","type":"text","x":60,"y":100,"text":"LAVE","fontSize":90,"fontFamily":"Georgia","fontStyle":"bold","fill":"#hexcolor","stroke":"","strokeWidth":0,"rotation":0,"opacity":1,"draggable":true,"letterSpacing":2}

Element 3 - subtitle text:
{"id":"e3","type":"text","x":60,"y":220,"text":"MINERAL WATER","fontSize":18,"fontFamily":"Outfit","fontStyle":"normal","fill":"#hexcolor","stroke":"","strokeWidth":0,"rotation":0,"opacity":1,"draggable":true,"letterSpacing":5}

Element 4 - thin divider rect:
{"id":"e4","type":"rect","x":60,"y":210,"width":340,"height":2,"fill":"#hexcolor","stroke":"","strokeWidth":0,"rotation":0,"opacity":0.6,"draggable":true}

Rules:
- Choose colors that strongly match the user theme
- All 3 designs must use different color schemes
- fontFamily for element 2: pick one of Georgia, Outfit, DM Sans, Trebuchet MS, Palatino
- Keep text values short under 20 chars
- Output valid complete JSON only`;


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    const geminiRes = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Generate 3 water bottle label designs for: "${prompt.trim()}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiRes.status} — ${errText}` },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();

    // Extract text from Gemini response format
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      console.error("Empty Gemini response:", JSON.stringify(data));
      return NextResponse.json(
        { error: "Empty response from Gemini" },
        { status: 502 }
      );
    }

    // Strip markdown code fences if Gemini adds them
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Validate it is JSON before sending back
    JSON.parse(cleaned);

    return NextResponse.json({ text: cleaned });
  } catch (err) {
    console.error("generate-label route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}