import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ registered: false });
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc("is_registered_lp", {
      email: email.toLowerCase().trim(),
    });

    if (error) {
      console.error("check-lp rpc error:", error.message);
      return NextResponse.json({ registered: false });
    }

    return NextResponse.json({ registered: !!data });
  } catch {
    return NextResponse.json({ registered: false });
  }
}
