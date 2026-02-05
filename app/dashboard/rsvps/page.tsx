import { supabaseServer } from "../../../lib/supabase-server";

export default async function RsvpsPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const sp = await searchParams;
  const slug = sp.slug?.toString();

  if (!slug) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-sm text-neutral-600">
            Missing <code>?slug=</code>
          </p>

          <p className="mt-3 text-xs text-neutral-500">
            Debug searchParams:
          </p>
          <pre className="mt-2 text-xs text-neutral-700 bg-white border rounded-xl p-3 text-left overflow-auto">
            {JSON.stringify(sp, null, 2)}
          </pre>

          <p className="mt-4 text-xs text-neutral-500">
            Try: <span className="font-mono">/dashboard/rsvps?slug=test</span>
          </p>
        </div>
      </main>
    );
  }

  const { data, error } = await supabaseServer
    .from("rsvps")
    .select("name, attending, created_at")
    .eq("invitation_slug", slug)
    .order("created_at", { ascending: false });

  const yes = data?.filter((r) => r.attending).length ?? 0;
  const no = data?.filter((r) => !r.attending).length ?? 0;

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold">RSVP</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Invitation slug: <span className="font-mono">{slug}</span>
        </p>

        {error ? (
          <pre className="mt-4 text-xs text-red-700 bg-white border rounded-xl p-3 overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        ) : null}

        <div className="mt-6 flex gap-4 text-sm">
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
            Particip: {yes}
          </span>
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">
            Nu pot: {no}
          </span>
        </div>

        <div className="mt-8 divide-y rounded-xl border bg-white">
          {data?.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span>{r.name}</span>
              <span className={r.attending ? "text-green-600" : "text-red-600"}>
                {r.attending ? "Participă" : "Nu poate"}
              </span>
            </div>
          ))}

          {(!data || data.length === 0) && (
            <p className="px-4 py-6 text-sm text-neutral-500">
              Niciun RSVP încă.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
