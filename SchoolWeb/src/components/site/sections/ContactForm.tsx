"use client";

import { useRef, useState, type FormEvent } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { CONTACT_COPY } from "@/lib/site/content";
import { submitEnquiry } from "@/app/(site)/contact/actions";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * `text-base` is load-bearing, not a style choice.
 *
 * Mobile Safari zooms the whole page in when a field smaller than 16px takes
 * focus, and it does not zoom back out afterwards. These fields were at
 * `0.95rem` — 15.2px — so tapping the first one threw the layout sideways on
 * every iPhone, and the visitor had to pinch their way back to the form.
 */
const FIELD =
  "w-full rounded-card border border-line bg-field px-4 py-3 text-base " +
  "placeholder:text-faint transition-[border-color,box-shadow] " +
  "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25 " +
  "aria-[invalid=true]:border-tile-rose";

const FIELD_ORDER = ["name", "email", "school", "message"] as const;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  /** Server-side validation is the only validation, so its result has to be
   *  announced and reachable — not just painted red. */
  function applyErrors(next: Record<string, string>) {
    setErrors(next);
    const first = FIELD_ORDER.find((field) => next[field]);
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrors({});
    setFailure("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? "");

    try {
      // A Server Action, not `fetch("/api/contact", …)`.
      //
      // The route handler this replaces was deliberately not carried over. An
      // `app/api/**/route.ts` is what `npm run postman` generates the committed
      // Postman collection from, and `npm run check:postman` fails CI when the
      // collection drifts from the routes — so a marketing contact endpoint
      // would have had to be published in the mobile API's collection just to
      // get a green build. An action has no route file, so it never enters that
      // surface at all. Everything the visitor experiences is unchanged; only
      // how the request travels is different.
      const result = await submitEnquiry({
        name: field("name"),
        email: field("email"),
        school: field("school"),
        message: field("message"),
        // The honeypot still travels. It is hidden from people and filled in by
        // bots, and the server is the only side that may act on it — dropping
        // it here would hand every scripted submission straight through.
        website: field("website"),
      });

      // The union carries the distinction the HTTP statuses used to. Per-field
      // `errors` is the old 422; a single `error` string is the old 400 / 429 /
      // 503, which the action phrases from `CONTACT_COPY` because it is what
      // the visitor reads. The `|| CONTACT_COPY.failure` covers an empty one —
      // a red panel with nothing in it says less than no panel at all.
      if ("errors" in result) {
        applyErrors(result.errors);
        setStatus("idle");
        return;
      }

      if ("error" in result) {
        setFailure(result.error || CONTACT_COPY.failure);
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      // An action that throws still reaches here: a dropped connection, or the
      // server erroring before it can shape a result.
      setFailure(CONTACT_COPY.failure);
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card-surface flex flex-col items-start gap-4 p-8" role="status">
        <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-600">
          <Check className="size-5" strokeWidth={2.4} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{CONTACT_COPY.sentTitle}</h2>
          <p className="mt-2 leading-relaxed text-muted">{CONTACT_COPY.sentBody}</p>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm font-medium text-brand-600 underline-offset-4 hover:underline"
        >
          {CONTACT_COPY.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="card-surface space-y-5 p-6 sm:p-8"
      noValidate
    >
      {/* Honeypot — hidden from people, tempting to bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] size-px opacity-0"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            {CONTACT_COPY.nameLabel}
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder={CONTACT_COPY.namePlaceholder}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={FIELD}
          />
          {errors.name ? (
            <p id="name-error" className="mt-1.5 text-xs text-tile-rose">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            {CONTACT_COPY.emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={CONTACT_COPY.emailPlaceholder}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={FIELD}
          />
          {errors.email ? (
            <p id="email-error" className="mt-1.5 text-xs text-tile-rose">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="school" className="mb-2 block text-sm font-medium">
          {CONTACT_COPY.schoolLabel}
        </label>
        <input
          id="school"
          name="school"
          required
          autoComplete="organization"
          placeholder={CONTACT_COPY.schoolPlaceholder}
          aria-invalid={Boolean(errors.school)}
          aria-describedby={errors.school ? "school-error" : undefined}
          className={FIELD}
        />
        {errors.school ? (
          <p id="school-error" className="mt-1.5 text-xs text-tile-rose">
            {errors.school}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium">
          {CONTACT_COPY.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder={CONTACT_COPY.messagePlaceholder}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={cn(FIELD, "resize-y")}
        />
        {errors.message ? (
          <p id="message-error" className="mt-1.5 text-xs text-tile-rose">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* `role="alert"` so a failure is spoken, not only coloured. */}
      <p role="alert" aria-live="assertive" className="empty:hidden">
        {failure ? (
          <span className="block rounded-card bg-tile-rose/10 p-3 text-sm text-tile-rose">
            {failure}
          </span>
        ) : null}
      </p>

      <button
        type="submit"
        disabled={status === "sending"}
        className="gradient-button inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[0.95rem] font-semibold text-white shadow-[0_10px_24px_-10px_rgb(123_104_238/0.6)] transition-[transform,box-shadow] hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            {CONTACT_COPY.sending}
          </>
        ) : (
          <>
            <Send className="size-4" strokeWidth={2.2} />
            {CONTACT_COPY.submit}
          </>
        )}
      </button>
    </form>
  );
}
