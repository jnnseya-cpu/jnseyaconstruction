"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/forms/Fields";
import { renewTalentPool, unsubscribeJobAlert } from "@/lib/forms/careers";
import { initialFormState } from "@/lib/forms/types";

const actions = { renew: renewTalentPool, unsubscribe: unsubscribeJobAlert };

/** One-button confirm for emailed links. A button (POST), so link scanners cannot trigger it. */
export function TokenActionForm({ kind, token, label }: { kind: keyof typeof actions; token: string; label: string }) {
  const [state, action] = useActionState(actions[kind], initialFormState);
  if (state.status === "success") return <div className="form-success" role="status"><p style={{ margin: 0 }}>{state.message}</p></div>;
  return (
    <form action={action} className="form">
      {state.status === "error" && <div className="error-summary" role="alert"><p style={{ margin: 0 }}>{state.message}</p></div>}
      <input type="hidden" name="token" value={token} />
      <div><SubmitButton pendingText="Please wait…">{label}</SubmitButton></div>
    </form>
  );
}
