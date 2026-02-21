export const runtime = "nodejs";

import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 },
      );
    }

    // 🔥 Convert file ke buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 🔥 Prevent Next bundler from executing pdf-parse at build time
    const pdf = eval("require")("pdf-parse");

    // 🔥 Extract text dari PDF
    const data = await pdf(buffer);

    if (!data?.text) {
      return NextResponse.json(
        { error: "Gagal membaca isi PDF" },
        { status: 500 },
      );
    }

    // 🔥 OpenAI instance
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // 🔥 Kirim ke OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Convert the following CPNS questions text into structured JSON format with: title, questions (question_text, options A-E, correct_answer, explanation). Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: data.text.slice(0, 15000), // batasi token
        },
      ],
      temperature: 0.2,
    });

    let jsonText = completion.choices[0].message.content || "";

    // 🔥 Bersihkan jika AI kasih ```json ```
    jsonText = jsonText.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("PARSE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
