export type ActionResult =
  | { ok: true; message: string; url?: string }
  | { ok: false; message: string };
