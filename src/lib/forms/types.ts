export type FieldErrors = Record<string, string>;

export interface FormState {
  status: "idle" | "error" | "success";
  errors?: FieldErrors;
  /** Echo of submitted text values so the form keeps them after an error. */
  values?: Record<string, string | string[]>;
  ref?: string;
  message?: string;
}

export const initialFormState: FormState = { status: "idle" };
