export type ActionResult = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
