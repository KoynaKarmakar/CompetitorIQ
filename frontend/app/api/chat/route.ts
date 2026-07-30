import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";

export async function POST(req: NextRequest) {
    try {
        const { message, context } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        const systemPrompt = `You are a competitive intelligence analyst assistant.
You have access to the following competitive intelligence context about a company and its competitors.
Use this context to answer questions accurately and concisely.
If asked about something not in the context, use your general knowledge but make clear you're doing so.

Format your answers in markdown, which is rendered for the user:
- Use "-" bullets or "1." numbered lists for multiple points, each on its own line.
- Use **bold** for the key term at the start of a list item.
- Keep paragraphs short. Do not use headings.

CONTEXT:
${context}`;

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message },
                ],
                temperature: 0.4,
                max_tokens: 900,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content ?? "No response generated.";

        return NextResponse.json({ reply });
    } catch (err) {
        console.error("[/api/chat]", err);
        return NextResponse.json(
            { error: "Chat failed. Check GROQ_API_KEY in frontend .env.local" },
            { status: 500 }
        );
    }
}
