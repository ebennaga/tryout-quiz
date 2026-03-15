export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // penting: pakai service role untuk admin
);

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await req.json();

  const { action } = body;

  if (action === "publish") {
    const { data, error } = await supabase
      .from("tryouts")
      .update({ is_active: true })
      .eq("id", id)
      .select();
  }

  if (action === "unpublish") {
    const { data, error } = await supabase
      .from("tryouts")
      .update({ is_active: false })
      .eq("id", id)
      .select();
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params; // 👈 tambah await

  await supabase.from("tryouts").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
