import { NextResponse } from 'next/server';

function parseMarkdownQuestions(md: string) {
  const blocks = md.split('## ').slice(1);

  return blocks.map((block) => {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const questionLines: string[] = [];
    const options: string[] = [];
    let correct_answer = ''; // 👈 ganti dari 'answer'
    let type = 'TWK';

    lines.forEach((line) => {
      if (/^[A-E]\./.test(line)) {
        options.push(line.substring(3).trim());
      } else if (line.toLowerCase().startsWith('jawaban')) {
        correct_answer = line.split(':')[1]?.trim().charAt(0) || '';
      } else if (line.toLowerCase().startsWith('type')) {
        // 👈 tambah ini
        type = line.split(':')[1]?.trim().toUpperCase() || 'TWK';
      } else if (!/^\d+$/.test(line)) {
        questionLines.push(line);
      }
    });

    return {
      question_text: questionLines.join(' '),
      options,
      correct_answer,
      type,
    };
  });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  const text = await file.text();

  const questions = parseMarkdownQuestions(text);

  return NextResponse.json({
    title: 'Tryout CPNS',
    questions,
  });
}
