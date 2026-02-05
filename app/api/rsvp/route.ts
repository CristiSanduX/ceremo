import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabase-server";

export async function POST(req: Request) {
  const body = await req.json();

  const invitationSlug = String(body.invitationSlug ?? "").trim();
  const name = String(body.name ?? "").trim();
  const attending = Boolean(body.attending);

  if (!invitationSlug || !name) {
    return NextResponse.json(
      { ok: false, error: "Missing invitationSlug or name" },
      { status: 400 }
    );
  }

  const { error } = await supabaseServer.from("rsvps").insert({
    invitation_slug: invitationSlug,
    name,
    attending,
  });

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
