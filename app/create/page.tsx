"use client";

import { useMemo, useState } from "react";

export default function CreatePage() {
  const [title, setTitle] = useState("Ana & Andrei");
  const [dateLabel, setDateLabel] = useState("14 iunie 2026");
  const [message, setMessage] = useState(
    "Cu emoție și bucurie, vă invităm să fiți alături de noi în ziua în care începem un nou capitol împreună."
  );
const [accessCode, setAccessCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const canSubmit = useMemo(() => title.trim().length >= 3, [title]);

  async function createInvitation() {
    if (!canSubmit) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/invitations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dateLabel,
          message,
accessCode: accessCode.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setStatus("error");
        setErrorMsg(json?.error?.message || json?.error || "Create failed");
        return;
      }

      window.location.href = `/i/${json.slug}`;
    } catch (e) {
      setStatus("error");
      setErrorMsg("Network error");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF9F7] px-6 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight">Create invitation</h1>
        <p className="mt-2 text-sm text-neutral-600">
          CEREMO MVP editor — title, date, message, access code.
        </p>

        <div className="mt-8 space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
          <div>
            <label className="text-xs text-neutral-600">Titlu</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
              placeholder="Ex: Ana & Andrei"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-600">Dată (label)</label>
            <input
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
              placeholder="Ex: 14 iunie 2026"
            />
          </div>

          <div>
            <label className="text-xs text-neutral-600">Mesaj</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
              placeholder="Text invitație..."
            />
          </div>

          <div>
            <label className="text-xs text-neutral-600">Access code (opțional)</label>
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
              placeholder="Ex: 1234"
            />
            <p className="mt-2 text-[11px] text-neutral-500">
              Dacă lași gol, invitația va fi publică (fără cod).
            </p>
          </div>

          {errorMsg ? (
            <p className="text-xs text-red-600">{errorMsg}</p>
          ) : null}

          <div className="flex items-center justify-end">
            <button
              disabled={!canSubmit || status === "loading"}
              onClick={createInvitation}
              className="rounded-xl bg-neutral-900 px-5 py-2 text-sm text-white disabled:opacity-50"
            >
              {status === "loading" ? "Saving..." : "Save & open"}
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-neutral-500">
          Tip: după ce se creează, primești link de forma <span className="font-mono">/i/&lt;slug&gt;</span>.
        </p>
      </div>
    </main>
  );
}
