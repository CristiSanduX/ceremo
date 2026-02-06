"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type Props = {
  title: string;
  dateLabel?: string | null;
  message?: string | null;
  ceremonyLabel?: string | null;
  partyLabel?: string | null;
  slug?: string;
  accessCode?: string | null;
  templateId?: string | null;
};

export default function InvitationClient({
  title,
  dateLabel,
  message,
  ceremonyLabel,
  partyLabel,
  slug,
  accessCode,
  templateId,
}: Props) {
  // Theme (by templateId)
  const tpl = (templateId || "ivory").toLowerCase();

  const theme =
    tpl === "night"
      ? {
          mainBg: "#0B0B0C",
          text: "text-white",
          subtext: "text-white/70",
          line: "bg-white/15",
          buttonGhost: "border-white/15 text-white hover:bg-white/5",
          buttonPrimary: "bg-white text-black",
        }
      : tpl === "minimal"
      ? {
          mainBg: "#FFFFFF",
          text: "text-neutral-900",
          subtext: "text-neutral-600",
          line: "bg-neutral-200",
          buttonGhost: "border-neutral-300 text-neutral-800 hover:bg-neutral-50",
          buttonPrimary: "bg-neutral-900 text-white",
        }
      : {
          // ivory default
          mainBg: "#FAF9F7",
          text: "text-neutral-900",
          subtext: "text-neutral-600",
          line: "bg-neutral-300",
          buttonGhost: "border-neutral-300 text-neutral-800 hover:bg-white",
          buttonPrimary: "bg-neutral-900 text-white",
        };

  // Access gate (if accessCode exists)
  const [unlocked, setUnlocked] = useState<boolean>(() => !accessCode);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  // Intro cinematic (starts only after unlock)
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    if (!unlocked) return;
    const t = setTimeout(() => setIntroDone(true), 2400);
    return () => clearTimeout(t);
  }, [unlocked]);

  // RSVP modal
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

  // Share / QR
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setShareUrl(window.location.href);
  }, []);

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    }
  }

  async function nativeShare() {
    if (!shareUrl) return;

    const payload = {
      title: title || "CEREMO",
      text: "Invitația noastră",
      url: shareUrl,
    };

    // Prefer native share on mobile
    if (navigator.share && (!navigator.canShare || navigator.canShare(payload))) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // cancelled -> ignore
      }
    }

    await copyLink();
  }

  // Gate screen (before intro)
  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#0B0B0C] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur"
        >
          <h1 className="text-xl font-semibold text-white">Access required</h1>
          <p className="mt-2 text-sm text-white/70">
            Introdu codul pentru a deschide invitația.
          </p>

          <div className="mt-5">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeError(false);
              }}
              placeholder="Cod"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/15"
            />
            {codeError && (
              <p className="mt-2 text-xs text-red-300">Cod greșit.</p>
            )}
          </div>

          <button
            onClick={() => {
              const ok = (code || "").trim() === (accessCode || "").trim();
              if (!ok) return setCodeError(true);
              setUnlocked(true);
              setIntroDone(false);
            }}
            className="mt-5 w-full rounded-xl bg-white text-black px-4 py-2 text-sm"
          >
            Deschide
          </button>
        </motion.div>
      </main>
    );
  }

  // Intro screen (shared element IDs) — keep cinematic dark
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

  // Main invitation (theme applied)
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: theme.mainBg }}
    >
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >
        <motion.h1
          layoutId="invitation-title"
          className={`text-4xl md:text-5xl font-serif tracking-tight ${theme.text}`}
        >
          {title}
        </motion.h1>

        {dateLabel ? (
          <motion.p
            layoutId="invitation-date"
            className={`mt-4 text-sm tracking-wide uppercase ${theme.subtext}`}
          >
            {dateLabel}
          </motion.p>
        ) : null}

        <div className={`my-10 h-px w-24 mx-auto ${theme.line}`} />

        {message ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.9, ease: "easeOut" }}
            className={`text-base leading-relaxed ${theme.subtext}`}
          >
            {message}
          </motion.p>
        ) : null}

        {(ceremonyLabel || partyLabel) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
            className={`mt-10 space-y-2 text-sm ${theme.subtext}`}
          >
            {ceremonyLabel ? <p>{ceremonyLabel}</p> : null}
            {partyLabel ? <p>{partyLabel}</p> : null}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9, ease: "easeOut" }}
          className="mt-14 flex flex-col items-center gap-3"
        >
          <button
            onClick={() => setOpen(true)}
            className={`rounded-full border px-5 py-2 text-sm transition ${theme.buttonGhost}`}
          >
            Confirmă prezența
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={nativeShare}
              className={`rounded-full border px-4 py-2 text-xs transition ${theme.buttonGhost}`}
            >
              Share
            </button>

            <button
              onClick={copyLink}
              className={`rounded-full border px-4 py-2 text-xs transition ${theme.buttonGhost}`}
            >
              {copied ? "Copied ✓" : "Copy link"}
            </button>

            <button
              onClick={() => setQrOpen(true)}
              className={`rounded-full border px-4 py-2 text-xs transition ${theme.buttonGhost}`}
            >
              QR
            </button>
          </div>

          {shareUrl ? (
            <p className={`mt-2 text-[11px] truncate max-w-[280px] ${theme.subtext}`}>
              {shareUrl}
            </p>
          ) : null}
        </motion.div>
      </motion.section>

      {/* RSVP Modal (kept white for MVP) */}
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

      {/* QR Modal */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              aria-label="Close"
              onClick={() => setQrOpen(false)}
              className="absolute inset-0 bg-black/30"
            />

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl border border-neutral-200 p-6 text-center"
            >
              <h2 className="text-lg font-semibold text-neutral-900">QR</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Scanează pentru a deschide invitația.
              </p>

              <div className="mt-6 flex justify-center">
                <div className="rounded-2xl border border-neutral-200 p-4 bg-white">
                  <QRCodeCanvas value={shareUrl || ""} size={220} />
                </div>
              </div>

              {shareUrl ? (
                <p className="mt-4 text-[11px] text-neutral-500 break-all">
                  {shareUrl}
                </p>
              ) : null}

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setQrOpen(false)}
                  className="text-sm text-neutral-600 hover:text-neutral-900"
                >
                  Închide
                </button>
                <button
                  onClick={copyLink}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white"
                >
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
