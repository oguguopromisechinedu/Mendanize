/** Shell session shape for Admin dashboard UI (MES-030). */
export type AdminShellSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
  };
  expires: string;
};
