"use client";

import { startTransition, useCallback, useState, type FormEvent } from "react";
import { requestUpload } from "@/lib/forms/upload-actions";
import { checkUpload, isUploadKind, uploadErrorField, type UploadKind } from "@/lib/forms/upload-rules";

/**
 * Sends chosen files straight to private storage before the form is sent;
 * the form then carries a signed receipt per file instead of the file. This
 * keeps form requests well under Vercel's 4.5MB body limit.
 *
 * Use with the server action still on the form, so the form works without
 * JavaScript (files then travel inside the form, up to 4.5MB on Vercel):
 *   const [state, dispatch] = useActionState(serverAction, initial);
 *   const { onSubmit, uploadStatus } = useDirectUploads(dispatch);
 *   <form action={dispatch} onSubmit={onSubmit}>
 *
 * If an upload fails, the form is still sent with an error marker for that
 * field, so the server answers with its usual error summary and the other
 * answers are kept.
 */
export function useDirectUploads(dispatch: (fd: FormData) => void) {
  const [uploadStatus, setStatus] = useState("");

  const put = (url: string, file: File, contentType: string) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setStatus(`Uploading ${file.name}: ${Math.round((e.loaded / e.total) * 100)}%`);
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status))));
      xhr.onerror = () => reject(new Error("network"));
      xhr.send(file);
    });

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      const form = e.currentTarget;
      const inputs = [...form.querySelectorAll<HTMLInputElement>('input[type="file"]')].filter((i) => i.files?.length);
      if (!inputs.length) return; // nothing to upload: let the form action run as normal
      e.preventDefault();
      const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
      const fd = new FormData(form, submitter);
      const buttons = [...form.querySelectorAll<HTMLButtonElement>('button[type="submit"]')];
      buttons.forEach((b) => (b.disabled = true));

      void (async () => {
        for (const input of inputs) {
          const field = input.name;
          const file = input.files![0];
          fd.delete(field);
          const kind: UploadKind = isUploadKind(input.dataset.uploadKind) ? input.dataset.uploadKind : "document";
          const problem = checkUpload(kind, file.name, file.size);
          if (problem) {
            fd.set(uploadErrorField(field), problem);
            continue;
          }
          try {
            setStatus(`Preparing ${file.name}…`);
            const ticket = await requestUpload(kind, file.name, file.size);
            if ("error" in ticket) {
              fd.set(uploadErrorField(field), ticket.error);
              continue;
            }
            await put(ticket.url, file, ticket.contentType);
            fd.set(field, ticket.receipt);
          } catch {
            fd.set(uploadErrorField(field), "The file did not upload. Check your connection and choose the file again");
          }
        }
        setStatus("Sending your form…");
        buttons.forEach((b) => (b.disabled = false));
        startTransition(() => dispatch(fd));
        setStatus("");
      })();
    },
    [dispatch],
  );

  return { onSubmit, uploadStatus };
}
