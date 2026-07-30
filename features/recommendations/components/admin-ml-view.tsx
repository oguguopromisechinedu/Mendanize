"use client";

import { useEffect, useState, useTransition } from "react";
import {
  listModelsAction,
  upsertModelAction,
  disableModelAction,
  getQualityMetricsAction,
} from "../actions-ml";

type Model = {
  id: string;
  name: string;
  description: string | null;
  status: "SHADOW" | "CANARY" | "DEFAULT" | "DISABLED";
  endpoint: string | null;
  rolloutPercent: number;
  configJson: string | null;
};

type Metrics = {
  totalClicks: number;
  ruleClicks: number;
  modelClicks: number;
  avgPosition: number | null;
  byDay: Array<{ date: string; clicks: number }>;
};

export function AdminMlView() {
  const [models, setModels] = useState<Model[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [editId, setEditId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Model["status"]>("SHADOW");
  const [endpoint, setEndpoint] = useState("");
  const [rolloutPercent, setRolloutPercent] = useState(0);

  function reload() {
    startTransition(async () => {
      const [m, q] = await Promise.all([
        listModelsAction(),
        getQualityMetricsAction({ sinceDaysAgo: 30 }),
      ]);
      setModels(m);
      setMetrics(q);
    });
  }

  useEffect(() => { reload(); }, []);

  function resetForm() {
    setEditId(undefined);
    setName("");
    setDescription("");
    setStatus("SHADOW");
    setEndpoint("");
    setRolloutPercent(0);
  }

  function editModel(m: Model) {
    setEditId(m.id);
    setName(m.name);
    setDescription(m.description ?? "");
    setStatus(m.status);
    setEndpoint(m.endpoint ?? "");
    setRolloutPercent(m.rolloutPercent);
  }

  function handleSave() {
    startTransition(async () => {
      await upsertModelAction({
        id: editId,
        name,
        description: description || undefined,
        status,
        endpoint: endpoint || undefined,
        rolloutPercent,
      });
      resetForm();
      reload();
    });
  }

  function handleDisable(modelId: string) {
    startTransition(async () => {
      await disableModelAction(modelId);
      reload();
    });
  }

  const statusBadge = (s: Model["status"]) => {
    const colors: Record<Model["status"], string> = {
      SHADOW: "bg-gray-100 text-gray-700",
      CANARY: "bg-yellow-100 text-yellow-800",
      DEFAULT: "bg-green-100 text-green-800",
      DISABLED: "bg-red-100 text-red-700",
    };
    return (
      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors[s]}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Quality metrics */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Click-through quality (30 days)</h2>
        {metrics ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Total clicks" value={metrics.totalClicks} />
            <Stat label="Rules-scored" value={metrics.ruleClicks} />
            <Stat label="Model-scored" value={metrics.modelClicks} />
            <Stat
              label="Avg position"
              value={metrics.avgPosition != null ? metrics.avgPosition.toFixed(1) : "—"}
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading…</p>
        )}
      </section>

      {/* Models table */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Registered models</h2>
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Rollout %</th>
                <th className="px-3 py-2">Endpoint</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {models.map((m) => (
                <tr key={m.id}>
                  <td className="px-3 py-2 font-medium">{m.name}</td>
                  <td className="px-3 py-2">{statusBadge(m.status)}</td>
                  <td className="px-3 py-2">{m.rolloutPercent}%</td>
                  <td className="px-3 py-2 max-w-[200px] truncate text-xs text-gray-500">
                    {m.endpoint ?? "—"}
                  </td>
                  <td className="flex gap-2 px-3 py-2">
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => editModel(m)}
                    >
                      Edit
                    </button>
                    {m.status !== "DISABLED" && (
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => handleDisable(m.id)}
                        disabled={isPending}
                      >
                        Disable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!models.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-400">
                    No models registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Upsert form */}
      <section className="rounded border p-4">
        <h3 className="mb-3 font-semibold">
          {editId ? "Edit model" : "Register new model"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium">Name</label>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. xgboost-v1"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Status</label>
            <select
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as Model["status"])}
            >
              <option value="SHADOW">Shadow</option>
              <option value="CANARY">Canary</option>
              <option value="DEFAULT">Default</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Endpoint URL</label>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://ml.example.com/rank"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Rollout % (canary)</label>
            <input
              type="number"
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={rolloutPercent}
              min={0}
              max={100}
              onChange={(e) => setRolloutPercent(Number(e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium">Description</label>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            className="rounded bg-black px-4 py-1.5 text-sm text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={isPending || !name}
          >
            {editId ? "Update" : "Create"}
          </button>
          {editId && (
            <button className="text-sm text-gray-500 hover:underline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{String(value)}</p>
    </div>
  );
}
