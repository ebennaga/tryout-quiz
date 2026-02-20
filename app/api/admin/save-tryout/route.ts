import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-session";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();

    // 🔐 1️⃣ Cek user login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔐 2️⃣ Cek role admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 },
      );
    }

    // 📦 3️⃣ Ambil data dari request
    const body = await req.json();
    const { title, description, duration_minutes, questions } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 📝 4️⃣ Insert Tryout
    const { data: tryout, error: tryoutError } = await supabase
      .from("tryouts")
      .insert({
        title,
        description: description || null,
        duration_minutes: duration_minutes || 110,
        is_published: false,
        created_by: user.id,
      })
      .select()
      .single();

    if (tryoutError) {
      return NextResponse.json({ error: tryoutError.message }, { status: 500 });
    }

    // 📚 5️⃣ Insert Questions + Options
    for (const q of questions) {
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert({
          tryout_id: tryout.id,
          question_text: q.question_text,
          explanation: q.explanation || null,
        })
        .select()
        .single();

      if (questionError) {
        return NextResponse.json(
          { error: questionError.message },
          { status: 500 },
        );
      }

      // Insert options
      for (const label in q.options) {
        const { error: optionError } = await supabase.from("options").insert({
          question_id: question.id,
          label,
          option_text: q.options[label],
          is_correct: label === q.correct_answer,
        });

        if (optionError) {
          return NextResponse.json(
            { error: optionError.message },
            { status: 500 },
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      tryout_id: tryout.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
