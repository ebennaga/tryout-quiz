import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-session';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No auth header' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      },
    );

    // 🔐 1️⃣ Cek user login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔐 2️⃣ Cek role admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 },
      );
    }

    // 📦 3️⃣ Ambil data dari request
    const body = await req.json();
    const { title, description, duration_minutes, questions } = body;

    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 📝 4️⃣ Insert Tryout
    const { data: tryout, error: tryoutError } = await supabase
      .from('tryouts')
      .insert({
        title,
        description: description || null,
        duration_minutes: duration_minutes || 90,
        is_active: false,
        created_by: user.id,
      })
      .select()
      .single();

    if (tryoutError) {
      return NextResponse.json({ error: tryoutError.message }, { status: 500 });
    }

    // 📚 5️⃣ Insert Questions + Options
    for (const q of questions) {
      const qType = q.type || q.question_type;
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert({
          tryout_id: tryout.id,
          question_text: q.question_text,
          question_type: qType, //
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
      // for (const label in q.options) {
      //   const { error: optionError } = await supabase.from('options').insert({
      //     question_id: question.id,
      //     label,
      //     option_text: q.options[label],
      //     is_correct: label === q.correct_answer,
      //   });

      //   if (optionError) {
      //     return NextResponse.json(
      //       { error: optionError.message },
      //       { status: 500 },
      //     );
      //   }
      // }
      const labels = ['A', 'B', 'C', 'D', 'E'] as const;

      const tkpScores: Record<(typeof labels)[number], number> = {
        A: 5,
        B: 4,
        C: 3,
        D: 2,
        E: 1,
      };

      for (let i = 0; i < q.options.length; i++) {
        const label = labels[i];
        const optionText = q.options[i];

        let score_value = 0;

        if (qType === 'TWK' || qType === 'TIU') {
          score_value = label === q.correct_answer ? 5 : 0;
        }

        if (qType === 'TKP') {
          score_value = tkpScores[label];
        }

        const { error: optionError } = await supabase.from('options').insert({
          question_id: question.id,
          option_label: label,
          option_text: optionText,
          is_correct: label === q.correct_answer,
          score_value,
        });

        if (optionError) {
          console.error('OPTION INSERT ERROR:', optionError);
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
