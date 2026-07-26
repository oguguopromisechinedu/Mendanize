"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FolderKanban } from "lucide-react";

import { AdminPageHeader, AdminPanel, AdminEmptyState } from "@/features/admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LearnerProjectRecord, ProjectTemplateRecord } from "@/services/ecosystem";
import { startLearnerProjectAction, updateProjectStatusAction } from "../actions/actions";

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  COMPLETED: "Completed",
};

const STATUS_BADGE: Record<string, "secondary" | "warning" | "outline" | "success"> = {
  NOT_STARTED: "secondary",
  IN_PROGRESS: "warning",
  SUBMITTED: "outline",
  COMPLETED: "success",
};

function ProjectCard({
  project,
  onStatusChange,
  pending,
}: {
  project: LearnerProjectRecord;
  onStatusChange: (id: string, status: string) => void;
  pending: boolean;
}) {
  const t = project.template;

  return (
    <AdminPanel title={t.title}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="outline">{DIFFICULTY_LABEL[t.difficulty] ?? t.difficulty}</Badge>
        <Badge variant="outline">{t.estimatedHours}h estimated</Badge>
        <Badge variant={STATUS_BADGE[project.status] ?? "secondary"}>
          {STATUS_LABEL[project.status] ?? project.status}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{t.brief}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.status === "NOT_STARTED" && (
          <Button
            size="sm"
            onClick={() => onStatusChange(project.id, "IN_PROGRESS")}
            disabled={pending}
          >
            Start project
          </Button>
        )}
        {project.status === "IN_PROGRESS" && (
          <>
            <Button
              size="sm"
              onClick={() => onStatusChange(project.id, "SUBMITTED")}
              disabled={pending}
            >
              Mark submitted
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(project.id, "COMPLETED")}
              disabled={pending}
            >
              Mark complete
            </Button>
          </>
        )}
        {project.status === "SUBMITTED" && (
          <Button
            size="sm"
            onClick={() => onStatusChange(project.id, "COMPLETED")}
            disabled={pending}
          >
            Mark complete
          </Button>
        )}
        {project.status === "COMPLETED" && (
          <span className="text-sm text-primary font-medium">
            Completed {project.completedAt ? new Date(project.completedAt).toLocaleDateString() : ""}
          </span>
        )}
      </div>
    </AdminPanel>
  );
}

function TemplateCard({
  template,
  onStart,
  pending,
}: {
  template: ProjectTemplateRecord;
  onStart: (templateId: string) => void;
  pending: boolean;
}) {
  return (
    <AdminPanel title={template.title}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="outline">{DIFFICULTY_LABEL[template.difficulty] ?? template.difficulty}</Badge>
        <Badge variant="outline">{template.estimatedHours}h estimated</Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{template.brief}</p>
      <Button size="sm" className="mt-4" onClick={() => onStart(template.id)} disabled={pending}>
        Start project
      </Button>
    </AdminPanel>
  );
}

export function ProjectsView({
  projects,
  templates,
}: {
  projects: LearnerProjectRecord[];
  templates: ProjectTemplateRecord[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStart(templateId: string) {
    startTransition(async () => {
      const res = await startLearnerProjectAction(templateId);
      if (res.ok) { toast.success("Project started"); router.refresh(); }
      else toast.error(res.message);
    });
  }

  function handleStatusChange(projectId: string, status: string) {
    startTransition(async () => {
      const res = await updateProjectStatusAction(projectId, status);
      if (res.ok) { toast.success("Project updated"); router.refresh(); }
      else toast.error(res.message);
    });
  }

  const startedTemplateIds = new Set(projects.map((p) => p.templateId));
  const availableTemplates = templates.filter((t) => !startedTemplateIds.has(t.id));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <AdminPageHeader
        title="Projects"
        description="Apply your learning by building real projects. Each project tracks your progress and helps you earn certificates."
      />

      {projects.length === 0 && templates.length === 0 && (
        <AdminEmptyState
          title="No projects available yet"
          description="The Mendanize team is building project tracks. Check back soon."
        />
      )}

      {projects.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <FolderKanban className="size-4" />
            Your projects
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onStatusChange={handleStatusChange}
                pending={pending}
              />
            ))}
          </div>
        </section>
      )}

      {availableTemplates.length > 0 && (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <FolderKanban className="size-4" />
            Available projects
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {availableTemplates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onStart={handleStart}
                pending={pending}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
