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
    const tkpScoreMap: Record<string, number> = {};
    let correct_answer = "";
    let type = "TWK";
    let inPenilaian = false; // 👈 flag untuk section penilaian

    lines.forEach((line) => {
      // Deteksi masuk section penilaian TKP
      if (
        line.toLowerCase().includes("penilaian") ||
        line.toLowerCase().includes("skala nilai")
      ) {
        inPenilaian = true;
        return;
      }

      if (/^[A-E]\./.test(line)) {
        if (inPenilaian) {
          // 👈 Baca skor dari section penilaian
          const label = line.charAt(0);
          const skorMatch = line.match(/skor\s*(\d+)/i);
          if (skorMatch) {
            tkpScoreMap[label] = parseInt(skorMatch[1]);
          }
        } else {
          // 👈 Opsi biasa (tanpa skor)
          if (options.length < 5) {
            options.push(line.substring(3).trim());
          }
        }
      } else if (line.toLowerCase().startsWith("jawaban")) {
        correct_answer = line.split(":")[1]?.trim().charAt(0) || "";
      } else if (line.toLowerCase().startsWith("type")) {
        type = line.split(":")[1]?.trim().toUpperCase() || "TWK";
      } else if (!inPenilaian && !/^\d+$/.test(line)) {
        questionLines.push(line);
      }
    });

    return {
      question_text: questionLines.join(" "),
      options,
      correct_answer,
      type,
      tkp_scores: Object.keys(tkpScoreMap).length > 0 ? tkpScoreMap : null,
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
