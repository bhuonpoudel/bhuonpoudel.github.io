import { useState, type SubmitEvent } from "react";
import { CheckCircle2Icon, LoaderCircleIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  /** JSON POST endpoint (Formspree, Web3Forms…). Empty → falls back to mailto. */
  endpoint?: string;
  email: string;
}

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm({ endpoint, email }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(data: Record<string, string>) {
    const e: Record<string, string> = {};
    if (!data.name?.trim()) e.name = "Please tell me your name.";
    if (!/^\S+@\S+\.\S+$/.test(data.email ?? "")) e.email = "Please enter a valid email.";
    if ((data.message?.trim().length ?? 0) < 10) e.message = "A little more detail, please (10+ characters).";
    return e;
  }

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (data._gotcha) return; // honeypot

    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length) return;

    if (!endpoint) {
      const body = `${data.message}\n\nFrom: ${data.name} (${data.email})`;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(data.subject || "Hello from your website")}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center" role="status">
        <CheckCircle2Icon className="size-10 text-primary" />
        <h3 className="font-heading text-xl font-semibold">Message sent</h3>
        <p className="text-sm text-muted-foreground">Thanks for reaching out. I'll get back to you soon.</p>
        <Button variant="outline" onClick={() => setStatus("idle")}>Send another</Button>
      </div>
    );
  }

  const field = (name: string) => ({
    id: name,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const error = (name: string) =>
    errors[name] && (
      <p id={`${name}-error`} className="text-xs text-destructive">
        {errors[name]}
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 rounded-2xl border bg-card p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input {...field("name")} autoComplete="name" placeholder="Your name" className="h-10" />
          {error("name")}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input {...field("email")} type="email" autoComplete="email" placeholder="you@example.com" className="h-10" />
          {error("email")}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="subject">Subject</Label>
        <Input {...field("subject")} placeholder="Consulting, collaboration, a question…" className="h-10" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea {...field("message")} rows={6} placeholder="Tell me a bit about your project or question." />
        {error("message")}
      </div>
      {/* honeypot for bots */}
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {status === "error" && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          Something went wrong. Please try again or email me directly at{" "}
          <a className="underline" href={`mailto:${email}`}>{email}</a>.
        </p>
      )}

      <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          {endpoint ? "I usually reply within two working days." : "This opens your email app with the message filled in."}
        </p>
        <Button type="submit" size="lg" disabled={status === "sending"} className="h-10 px-5">
          {status === "sending" ? <LoaderCircleIcon className="animate-spin" /> : <SendIcon data-icon="inline-start" />}
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
