import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { requirePublicUser } from "@/features/authentication/server"
import {
  addContractMilestoneAction,
  cancelContinuationAction,
  completeContractAction,
  createMaintenanceTaskAction,
  fundMilestoneAction,
  releaseMilestoneAction,
  startContinuationAction,
  startMaintenanceRetainerAction,
  cancelMaintenanceRetainerAction,
  updateMaintenanceTaskStatusAction,
} from "@/features/growth"
import { getContractWorkspace } from "@/services/marketplace"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Project Workspace",
  robots: { index: false },
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const session = await requirePublicUser()
  if (!session?.user?.id) {
    redirect(`/sign-in?callbackUrl=${encodeURIComponent("/account/work")}`)
  }

  const { id } = await params
  const workspace = await getContractWorkspace(id, session.user.id)
  if (!workspace) notFound()

  const isClient = workspace.clientId === session.user.id
  const isWorker = workspace.workerId === session.user.id
  const isContinuation = workspace.kind === "CONTINUATION"
  const showMaintenancePanel =
    workspace.status === "COMPLETED" ||
    isContinuation ||
    (workspace.status === "ACTIVE" && workspace.tasks.length > 0)

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-primary">
          {isContinuation ? "Maintenance Workspace" : "Project Workspace"}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          {workspace.websiteLabel ?? workspace.jobTitle}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Contract {workspace.status.toLowerCase()}
          {isContinuation ? " · continuation" : ""} · Client{" "}
          {workspace.clientName ?? "—"} · Freelancer{" "}
          {workspace.workerName ?? "—"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/account/messages">Open messages</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={isClient ? "/account/hiring" : "/account/work"}>
              Back
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link
              href={
                isClient
                  ? "/account/hiring/disputes"
                  : "/account/work/disputes"
              }
            >
              Disputes
            </Link>
          </Button>
          {workspace.parentContractId ? (
            <Button asChild variant="outline" className="rounded-xl">
              <Link
                href={`/account/work/contracts/${workspace.parentContractId}`}
              >
                Original project
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Milestones & escrow</h2>
        <p className="text-sm text-muted-foreground">
          Client funds each milestone into Mendanize escrow. After approval,
          payment is released to the freelancer minus platform commission.
        </p>
        <ul className="space-y-4">
          {workspace.milestones.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border border-border/50 bg-card/50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{m.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    ${(m.amountCents / 100).toFixed(2)} · {m.status}
                    {m.paymentStatus ? ` · payment ${m.paymentStatus}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isClient && m.status === "PENDING" ? (
                    <form action={fundMilestoneAction}>
                      <input type="hidden" name="milestoneId" value={m.id} />
                      <Button type="submit" size="sm" className="rounded-xl">
                        Fund escrow
                      </Button>
                    </form>
                  ) : null}
                  {isClient && m.status === "FUNDED" ? (
                    <form action={releaseMilestoneAction}>
                      <input type="hidden" name="milestoneId" value={m.id} />
                      <Button type="submit" size="sm" className="rounded-xl">
                        Approve & release
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
          {workspace.milestones.length === 0 ? (
            <li className="text-sm text-muted-foreground">No milestones yet.</li>
          ) : null}
        </ul>
      </section>

      {isClient && workspace.status === "ACTIVE" ? (
        <section className="space-y-3 border-t border-border/50 pt-8">
          <h2 className="text-lg font-medium">Add milestone</h2>
          <form
            action={addContractMilestoneAction}
            className="grid gap-2 sm:grid-cols-[1fr_140px_auto]"
          >
            <input type="hidden" name="contractId" value={workspace.id} />
            <input
              name="title"
              required
              placeholder="Milestone title"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              name="amountDollars"
              type="number"
              min={1}
              step={1}
              required
              placeholder="Amount ($)"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <Button type="submit" className="rounded-xl">
              Add
            </Button>
          </form>
        </section>
      ) : null}

      {isClient &&
      workspace.status === "ACTIVE" &&
      workspace.kind === "PROJECT" ? (
        <section className="space-y-3 border-t border-border/50 pt-8">
          <h2 className="text-lg font-medium">Accept delivery</h2>
          <p className="text-sm text-muted-foreground">
            Mark this project complete when you are satisfied. Pending or funded
            milestones must be cleared first. You can start ongoing maintenance
            afterward.
          </p>
          <form action={completeContractAction}>
            <input type="hidden" name="contractId" value={workspace.id} />
            <Button type="submit" className="rounded-xl">
              Mark project complete
            </Button>
          </form>
        </section>
      ) : null}

      {showMaintenancePanel ? (
        <section className="space-y-6 border-t border-border/50 pt-8">
          <div>
            <h2 className="text-lg font-medium">Maintenance & Support</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep working with the same developer — request updates, track
              tasks, and review payment history for this website.
            </p>
          </div>

          {isClient &&
          workspace.status === "COMPLETED" &&
          !workspace.activeContinuationId ? (
            <div className="space-y-3 rounded-2xl border border-border/50 bg-card/40 p-4">
              <h3 className="font-medium">Continue working</h3>
              <p className="text-sm text-muted-foreground">
                Opens a new maintenance contract linked to this project. The
                completed delivery stays unchanged.
              </p>
              <form action={startContinuationAction} className="grid gap-2">
                <input
                  type="hidden"
                  name="sourceContractId"
                  value={workspace.id}
                />
                <input
                  name="websiteLabel"
                  defaultValue={
                    workspace.websiteLabel ?? workspace.jobTitle
                  }
                  placeholder="Website name"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                <textarea
                  name="openingNote"
                  rows={2}
                  placeholder="Optional note for the developer"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
                <Button type="submit" className="w-fit rounded-xl">
                  Hire again / Continue working
                </Button>
              </form>
            </div>
          ) : null}

          {isClient &&
          workspace.status === "COMPLETED" &&
          workspace.activeContinuationId ? (
            <div className="rounded-2xl border border-border/50 bg-card/40 p-4">
              <p className="text-sm text-muted-foreground">
                Maintenance is active for this project.
              </p>
              <Button asChild className="mt-3 rounded-xl">
                <Link
                  href={`/account/work/contracts/${workspace.activeContinuationId}`}
                >
                  Open maintenance workspace
                </Link>
              </Button>
            </div>
          ) : null}

          {workspace.status === "ACTIVE" && isContinuation ? (
            <>
              <div className="space-y-3 rounded-2xl border border-border/50 bg-card/40 p-4">
                <h3 className="font-medium">Monthly retainer</h3>
                <p className="text-sm text-muted-foreground">
                  Subscribe to ongoing support instead of paying per small task.
                  Funds use Stripe Connect (not Mendanize learner billing). Fair
                  use applies — large features stay as paid tasks.
                </p>
                {workspace.retainer ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">{workspace.retainer.tier}</span>
                      {" · "}
                      ${(workspace.retainer.amountCents / 100).toFixed(0)}/mo ·{" "}
                      {workspace.retainer.status}
                      {workspace.retainer.cancelAtPeriodEnd
                        ? " · ends after current period"
                        : ""}
                    </p>
                    {workspace.retainer.currentPeriodEnd ? (
                      <p className="text-xs text-muted-foreground">
                        Period ends{" "}
                        {new Date(
                          workspace.retainer.currentPeriodEnd,
                        ).toLocaleDateString()}
                      </p>
                    ) : null}
                    {isClient &&
                    workspace.retainer.status !== "CANCELLED" &&
                    !workspace.retainer.cancelAtPeriodEnd ? (
                      <form action={cancelMaintenanceRetainerAction}>
                        <input
                          type="hidden"
                          name="contractId"
                          value={workspace.id}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                        >
                          Cancel at period end
                        </Button>
                      </form>
                    ) : null}
                    {workspace.retainerPayments.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {workspace.retainerPayments.map((p) => (
                          <li key={p.id}>
                            Invoice ${(p.amountCents / 100).toFixed(2)} ·{" "}
                            {p.status} · fee $
                            {(p.platformFeeCents / 100).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : isClient ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {workspace.maintenancePlans.map((plan) => (
                      <form
                        key={plan.tier}
                        action={startMaintenanceRetainerAction}
                        className="flex flex-col gap-2 rounded-xl border border-border/40 p-3"
                      >
                        <input
                          type="hidden"
                          name="contractId"
                          value={workspace.id}
                        />
                        <input type="hidden" name="tier" value={plan.tier} />
                        <p className="font-medium">{plan.label}</p>
                        <p className="text-lg font-semibold tabular-nums">
                          ${(plan.amountCents / 100).toFixed(0)}
                          <span className="text-sm font-normal text-muted-foreground">
                            /mo
                          </span>
                        </p>
                        <p className="flex-1 text-xs text-muted-foreground">
                          {plan.summary}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {plan.fairUse}
                        </p>
                        <Button type="submit" size="sm" className="rounded-xl">
                          Start {plan.tier.toLowerCase()}
                        </Button>
                      </form>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No monthly plan yet. The client can start one from this
                    panel.
                  </p>
                )}
              </div>

              {isClient ? (
                <div className="space-y-3">
                  <h3 className="font-medium">Request a task</h3>
                  <form
                    action={createMaintenanceTaskAction}
                    className="grid gap-2"
                  >
                    <input
                      type="hidden"
                      name="contractId"
                      value={workspace.id}
                    />
                    <input
                      name="title"
                      required
                      placeholder="Task title"
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      name="description"
                      required
                      rows={3}
                      placeholder="What needs to be done?"
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <select
                        name="type"
                        defaultValue="FEATURE"
                        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="FEATURE">Feature</option>
                        <option value="BUG">Bug</option>
                        <option value="CONTENT">Content</option>
                        <option value="SEO">SEO</option>
                        <option value="PERFORMANCE">Performance</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <select
                        name="priority"
                        defaultValue="NORMAL"
                        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                      </select>
                      <input
                        name="amountDollars"
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Budget $ (optional)"
                        className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    {workspace.retainer &&
                    (workspace.retainer.status === "ACTIVE" ||
                      workspace.retainer.status === "TRIALING") ? (
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          name="coveredByRetainer"
                          value="1"
                        />
                        Cover under monthly retainer (no escrow milestone)
                      </label>
                    ) : null}
                    <Button type="submit" className="w-fit rounded-xl">
                      Submit request
                    </Button>
                  </form>
                </div>
              ) : null}

              <div className="space-y-3">
                <h3 className="font-medium">Tasks</h3>
                <ul className="space-y-3">
                  {workspace.tasks.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                      No tasks yet.
                    </li>
                  ) : (
                    workspace.tasks.map((t) => (
                      <li
                        key={t.id}
                        className="rounded-2xl border border-border/50 bg-card/50 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="font-medium">{t.title}</h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {t.description}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {t.type} · {t.priority} · {t.status}
                              {t.coveredByRetainer ? " · under retainer" : ""}
                              {t.amountCents != null
                                ? ` · $${(t.amountCents / 100).toFixed(2)}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {isWorker && t.status === "REQUESTED" ? (
                              <>
                                <form
                                  action={updateMaintenanceTaskStatusAction}
                                >
                                  <input
                                    type="hidden"
                                    name="taskId"
                                    value={t.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="contractId"
                                    value={workspace.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="ACCEPTED"
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    className="rounded-xl"
                                  >
                                    Accept
                                  </Button>
                                </form>
                                <form
                                  action={updateMaintenanceTaskStatusAction}
                                >
                                  <input
                                    type="hidden"
                                    name="taskId"
                                    value={t.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="contractId"
                                    value={workspace.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="DECLINED"
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    variant="outline"
                                    className="rounded-xl"
                                  >
                                    Decline
                                  </Button>
                                </form>
                              </>
                            ) : null}
                            {isWorker &&
                            (t.status === "ACCEPTED" ||
                              t.status === "IN_PROGRESS") ? (
                              <form action={updateMaintenanceTaskStatusAction}>
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={t.id}
                                />
                                <input
                                  type="hidden"
                                  name="contractId"
                                  value={workspace.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="SUBMITTED"
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  className="rounded-xl"
                                >
                                  Mark submitted
                                </Button>
                              </form>
                            ) : null}
                            {isClient && t.status === "SUBMITTED" ? (
                              <form action={updateMaintenanceTaskStatusAction}>
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={t.id}
                                />
                                <input
                                  type="hidden"
                                  name="contractId"
                                  value={workspace.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="DONE"
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  className="rounded-xl"
                                >
                                  Approve done
                                </Button>
                              </form>
                            ) : null}
                            {isClient &&
                            (t.status === "REQUESTED" ||
                              t.status === "ACCEPTED") ? (
                              <form action={updateMaintenanceTaskStatusAction}>
                                <input
                                  type="hidden"
                                  name="taskId"
                                  value={t.id}
                                />
                                <input
                                  type="hidden"
                                  name="contractId"
                                  value={workspace.id}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="CANCELLED"
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl"
                                >
                                  Cancel
                                </Button>
                              </form>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          ) : null}

          <div className="space-y-3">
            <h3 className="font-medium">Payment history</h3>
            <ul className="space-y-2 text-sm">
              {workspace.lineagePayments.length === 0 ? (
                <li className="text-muted-foreground">No payments recorded.</li>
              ) : (
                workspace.lineagePayments.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap justify-between gap-2 border-b border-border/40 py-2"
                  >
                    <span>
                      {p.milestoneTitle ?? "Payment"} · {p.status}
                    </span>
                    <span className="text-muted-foreground">
                      ${(p.amountCents / 100).toFixed(2)}
                      {p.platformFeeCents
                        ? ` (fee $${(p.platformFeeCents / 100).toFixed(2)})`
                        : ""}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {isContinuation &&
          workspace.status === "ACTIVE" &&
          (isClient || isWorker) ? (
            <div className="space-y-2 border-t border-border/40 pt-6">
              <h3 className="font-medium">End maintenance</h3>
              <p className="text-sm text-muted-foreground">
                Ends this continuation contract. Pending or funded milestones
                must be cleared first. You can start a new continuation later
                from the original completed project.
              </p>
              <form action={cancelContinuationAction}>
                <input type="hidden" name="contractId" value={workspace.id} />
                <Button
                  type="submit"
                  variant="outline"
                  className="rounded-xl"
                >
                  End maintenance contract
                </Button>
              </form>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Monthly plans bill via Stripe Connect destination charges with
            platform commission. Cancel anytime at period end.
          </p>
        </section>
      ) : null}
    </div>
  )
}
