import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase-server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/ă/g, "a")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/ș/g, "s")
    .replace(/ț/g, "t")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function rand4() {
  return Math.random().toString(36).slice(2, 6);
}

export async function POST(req: Request) {
  const body = await req.json();

  const title = String(body.title ?? "").trim();
  const dateLabel = String(body.dateLabel ?? "").trim();
  const message = String(body.message ?? "").trim();
  const accessCodeRaw = String(body.accessCode ?? "").trim();
  const templateId = String(body.templateId ?? "ivory").trim() || "ivory";
const allowed = new Set(["ivory", "night", "minimal"]);
const safeTemplateId = allowed.has(templateId) ? templateId : "ivory";


  if (!title || title.length < 3) {
    return NextResponse.json({ ok: false, error: "Title too short" }, { status: 400 });
  }

  const base = slugify(title) || "invitation";
  let slug = base;

  // avoid collisions by appending random suffix if needed
  // try a few times
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabaseServer
      .from("invitations")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;
    slug = `${base}-${rand4()}`;
  }

  const accessCode = accessCodeRaw.length ? accessCodeRaw : null;

  const { error } = await supabaseServer.from("invitations").insert({
    slug,
    title,
    date_label: dateLabel || null,
    message: message || null,
    access_code: accessCode,
    template_id: safeTemplateId,
  });

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug });
}
