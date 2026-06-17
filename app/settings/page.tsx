import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { styles } from "@/lib/design";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <p className={styles.eyebrow}>Settings</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Configure your workspace experience
          </h1>
          <p className="mt-2 text-slate-400">
            Customize profile details, notifications, and dashboard defaults for your team.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className={`${styles.glass} p-6`}>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Account settings</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Profile and access</h2>
            </div>

            <form className="mt-6 space-y-5">
              {[
                { label: "Workspace name", value: "Mendanize Studio" },
                { label: "Primary email", value: "team@mendanize.com" },
                { label: "Default writer tone", value: "Professional" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-sm font-medium text-slate-300">{field.label}</label>
                  <input
                    type="text"
                    value={field.value}
                    readOnly
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  />
                </div>
              ))}

              <button className="inline-flex rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">
                Save changes
              </button>
            </form>
          </div>

          <div className={`${styles.glass} p-6`}>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Notifications</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Delivery preferences</h2>

            <div className="mt-6 space-y-4">
              {[
                { label: "Weekly performance summary", status: true },
                { label: "New draft alerts", status: false },
                { label: "Template recommendations", status: true },
              ].map((setting) => (
                <div
                  key={setting.label}
                  className="flex items-center justify-between rounded-3xl bg-slate-950/80 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{setting.label}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {setting.status ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-6 w-11 items-center rounded-full px-1 transition ${
                      setting.status ? "bg-cyan-500/20" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white transition ${
                        setting.status ? "translate-x-5 bg-cyan-400" : "translate-x-0 bg-slate-500"
                      }`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
