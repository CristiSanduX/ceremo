import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabase-server";

function csvEscape(v: string) {
  const s = (v ?? "").toString();
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") ?? "").trim();

  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("rsvps")
    .select("name, attending, created_at")
    .eq("invitation_slug", slug)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }

  const rows = data ?? [];
  const header = ["name", "attending", "created_at"].join(",");
  const lines = rows.map((r) =>
    [
      csvEscape(r.name),
      r.attending ? "yes" : "no",
      csvEscape(r.created_at ?? ""),
    ].join(",")
  );

  const csv = [header, ...lines].join("\n");
  const filename = `rsvps-${slug}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
