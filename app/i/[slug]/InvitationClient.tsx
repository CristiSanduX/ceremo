"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Props = {
  title: string;
  dateLabel?: string | null;
  message?: string | null;
  ceremonyLabel?: string | null;
  partyLabel?: string | null;
  slug?: string;
};

export default function InvitationClient({
  title,
  dateLabel,
  message,
  ceremonyLabel,
  partyLabel,
  slug,
}: Props) {
  // Intro cinematic
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), 2400);
    return () => clearTimeout(t);
  }, []);

  // RSVP modal state
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<null | boolean>(true);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );

  const canSubmit = useMemo(() => {
    return Boolean(slug && name.trim().length >= 2 && attending !== null);
  }, [slug, name, attending]);

  async function submit() {
    if (!canSubmit) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationSlug: slug,
          name: name.trim(),
          attending,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("ok");
      setTimeout(() => {
        setOpen(false);
        setName("");
        setAttending(true);
        setStatus("idle");
      }, 900);
    } catch {
      setStatus("error");
    }
  }

  // Intro screen (shared element IDs)
  if (!introDone) {
    return (
      <main className="min-h-screen bg-[#0B0B0C] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <motion.h1
            layoutId="invitation-title"
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-serif tracking-tight text-white"
          >
            {title}
          </motion.h1>

          {dateLabel ? (
            <motion.p
              layoutId="invitation-date"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
              className="mt-4 text-sm tracking-[0.22em] uppercase text-white/80"
            >
              {dateLabel}
            </motion.p>
          ) : null}

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.7 }}
            transition={{ delay: 0.6, duration: 1.0, ease: "easeOut" }}
            className="mx-auto mt-10 h-px w-32 origin-center bg-white/30"
          />
        </motion.div>
      </main>
    );
  }

  // Main invitation
  return (
    <main className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-6">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >
        <motion.h1
          layoutId="invitation-title"
          className="text-4xl md:text-5xl font-serif tracking-tight text-neutral-900"
        >
          {title}
        </motion.h1>

        {dateLabel ? (
          <motion.p
            layoutId="invitation-date"
            className="mt-4 text-sm tracking-wide uppercase text-neutral-600"
          >
            {dateLabel}
          </motion.p>
        ) : null}

        <div className="my-10 h-px w-24 mx-auto bg-neutral-300" />

        {message ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.9, ease: "easeOut" }}
            className="text-base leading-relaxed text-neutral-700"
          >
            {message}
          </motion.p>
        ) : null}

        {(ceremonyLabel || partyLabel) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
            className="mt-10 space-y-2 text-sm text-neutral-600"
          >
            {ceremonyLabel ? <p>{ceremonyLabel}</p> : null}
            {partyLabel ? <p>{partyLabel}</p> : null}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: "easeOut" }}
          className="mt-14 flex justify-center"
        >
          <button
            onClick={() => setOpen(true)}
            className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-800 hover:bg-white transition"
          >
            Confirmă prezența
          </button>
        </motion.div>
      </motion.section>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/30"
            />

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl border border-neutral-200 p-6"
            >
              <h2 className="text-lg font-semibold text-neutral-900">
                Confirmare prezență
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Completează numele și alege opțiunea.
              </p>

              <div className="mt-5">
                <label className="text-xs text-neutral-600">Nume</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Popescu"
                  className="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAttending(true)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    attending === true
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  Particip
                </button>
                <button
                  onClick={() => setAttending(false)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    attending === false
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
                  }`}
                >
                  Nu pot
                </button>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Închide
                </button>

                <button
                  disabled={!canSubmit || status === "loading"}
                  onClick={submit}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {status === "loading"
                    ? "Se trimite..."
                    : status === "ok"
                    ? "Trimis ✓"
                    : "Trimite"}
                </button>
              </div>

              {status === "error" && (
                <p className="mt-3 text-xs text-red-600">
                  A apărut o eroare. Încearcă din nou.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
