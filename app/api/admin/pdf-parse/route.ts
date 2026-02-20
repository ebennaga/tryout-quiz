import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import OpenAI from "openai";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "File tidak ditemukan" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const data = await pdf(buffer); // ✅ ini akan jalan

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Convert the following CPNS questions text into structured JSON format with: title, questions (question_text, options A-E, correct_answer, explanation). Return only JSON.",
      },
      {
        role: "user",
        content: data.text,
      },
    ],
  });

  const json = completion.choices[0].message.content;

  return NextResponse.json(JSON.parse(json!));
}
