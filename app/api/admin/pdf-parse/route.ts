import { NextResponse } from "next/server";

function parseMarkdownQuestions(md: string) {
  const blocks = md.split("## ").slice(1);

  return blocks.map((block) => {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const questionLines: string[] = [];
    const options: string[] = [];
    let answer = "";

    lines.forEach((line) => {
      if (/^[A-E]\./.test(line)) {
        options.push(line.substring(3).trim());
      } else if (line.toLowerCase().startsWith("jawaban")) {
        answer = line.split(":")[1]?.trim().charAt(0) || "";
      } else if (!/^\d+$/.test(line)) {
        questionLines.push(line);
      }
    });

    return {
      question_text: questionLines.join(" "),
      options,
      answer,
    };
  });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const text = await file.text();

  const questions = parseMarkdownQuestions(text);

  return NextResponse.json({
    title: "Tryout CPNS",
    questions,
  });
}
