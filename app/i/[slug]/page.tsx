import InvitationClient from "./InvitationClient";
import { supabaseServer } from "../../../lib/supabase-server";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await supabaseServer
    .from("invitations")
    .select("title, date_label, message, access_code")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold">Invitation not found</h1>
          <p className="mt-3 text-sm text-neutral-600">
            Slug: <span className="font-mono">{slug}</span>
          </p>
          <pre className="mt-4 text-left text-xs text-neutral-600 whitespace-pre-wrap">
            {JSON.stringify({ error }, null, 2)}
          </pre>
        </div>
      </main>
    );
  }

  return (
    <InvitationClient
      slug={slug}
      title={data.title}
      dateLabel={data.date_label}
      message={data.message}
      accessCode={data.access_code}
      ceremonyLabel={null}
      partyLabel={null}
    />
  );
}
