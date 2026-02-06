import Link from "next/link";

const templates = [
  {
    id: "ivory",
    name: "Ivory",
    desc: "Warm minimal, editorial wedding vibe.",
    href: "/i/test", // poți pune un demo slug separat mai târziu
  },
  {
    id: "night",
    name: "Night",
    desc: "Dark luxury, cinematic intro.",
    href: "/i/test",
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Ultra clean, fast and timeless.",
    href: "/i/test",
  },
];

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm tracking-wide uppercase text-neutral-600">
            CEREMO
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-neutral-700 hover:text-neutral-900" href="/create">
              Create
            </Link>
          </nav>
        </header>

        <h1 className="mt-10 text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
          Templates
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Alege un stil. Preview live. Personalizează în câteva minute.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {templates.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className="group rounded-3xl border border-neutral-200 bg-white p-6 hover:shadow-sm transition"
            >
              <div className="rounded-2xl bg-neutral-900 p-7 text-white">
                <div className="text-xs tracking-[0.22em] uppercase text-white/70">
                  Template
                </div>
                <div className="mt-3 text-2xl font-serif">{t.name}</div>
                <div className="mt-5 h-px w-20 bg-white/15" />
                <div className="mt-5 text-sm text-white/75">
                  Live preview
                </div>
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium text-neutral-900">
                  {t.name}
                </div>
                <div className="mt-1 text-xs text-neutral-600">{t.desc}</div>
                <div className="mt-4 text-xs text-neutral-700 group-hover:text-neutral-900">
                  Open preview →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
