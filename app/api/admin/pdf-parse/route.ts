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

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdf = eval("require")("pdf-parse");
    const data = await pdf(buffer);

    if (!data?.text) {
      return NextResponse.json({ error: "Gagal membaca PDF" }, { status: 500 });
    }

    const rawText = data.text;

    // =====================================================
    // 🔥 STEP 1: REGEX EXTRACT SOAL TANPA AI
    // =====================================================
    // =====================================================
    // 1️⃣ Split dulu jadi blocks
    const blocks =
      rawText.match(
        /^\s*\d{1,3}[\.\)]?\s+[\s\S]*?(?=^\s*\d{1,3}[\.\)]?\s+|\Z)/gm,
      ) || [];

    // 2️⃣ Filter hanya nomor sequential
    const questions: any[] = [];
    let expectedNumber = 1;

    for (const block of blocks) {
      const numberMatch = block.match(/^\s*(\d{1,3})/);
      if (!numberMatch) continue;

      const detectedNumber = parseInt(numberMatch[1]);

      // ✅ Hanya ambil jika nomor sesuai urutan
      if (detectedNumber !== expectedNumber) continue;

      const optionRegex = /([A-E])[\.\)]?\s([\s\S]*?)(?=\n[A-E][\.\)]?\s|\Z)/g;

      const options: any = {};
      let optMatch;

      while ((optMatch = optionRegex.exec(block)) !== null) {
        options[optMatch[1]] = optMatch[2].trim();
      }

      const question_text = block
        .replace(/^\s*\d{1,3}[\.\)]?\s+/, "")
        .split(/A[\.\)]?\s/)[0]
        .trim();

      questions.push({
        question_number: detectedNumber,
        question_text,
        options,
        correct_answer: null,
        explanation: null,
      });

      expectedNumber++;
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "Soal tidak terdeteksi" },
        { status: 400 },
      );
    }

    // =====================================================
    // 🔥 STEP 2: AI HANYA ISI JAWABAN & PEMBAHASAN
    // =====================================================

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const chunkSize = 10;

    for (let i = 0; i < questions.length; i += chunkSize) {
      const chunk = questions.slice(i, i + chunkSize);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `
You are solving CPNS multiple choice questions.
Return ONLY JSON array:
[
  {
    "question_number": number,
    "correct_answer": "A/B/C/D/E",
    "explanation": "short explanation"
  }
]
Do NOT skip any question.
`,
          },
          {
            role: "user",
            content: JSON.stringify(chunk),
          },
        ],
      });

      let jsonText = completion.choices[0].message.content || "";
      jsonText = jsonText.replace(/```json|```/g, "").trim();

      const aiAnswers = JSON.parse(jsonText);

      // Merge jawaban ke soal asli
      for (const ans of aiAnswers) {
        const q = questions.find(
          (q) => q.question_number === ans.question_number,
        );
        if (q) {
          q.correct_answer = ans.correct_answer;
          q.explanation = ans.explanation;
        }
      }
    }

    // =====================================================
    // 🔥 RETURN FINAL STRUCTURE
    // =====================================================

    return NextResponse.json({
      title: "Tryout CPNS",
      total_questions: questions.length,
      questions,
    });
  } catch (error: any) {
    console.error("ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
