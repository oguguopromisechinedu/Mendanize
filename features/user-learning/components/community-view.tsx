"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users } from "lucide-react";

import { AdminPageHeader, AdminPanel, AdminEmptyState } from "@/features/admin-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CommunityPostRecord } from "@/services/ecosystem";
import { createCommunityPostAction } from "../actions/actions";

const ENTITY_LABEL: Record<string, string> = {
  GUIDE: "Guide",
  PROJECT: "Project",
};

function PostCard({ post }: { post: CommunityPostRecord }) {
  const when = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AdminPanel>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {post.authorName ? post.authorName.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {post.authorName ?? "Mendanize learner"}
            </p>
            <p className="text-xs text-muted-foreground">{when}</p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">
          {ENTITY_LABEL[post.entityType] ?? post.entityType}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {post.body}
      </p>
    </AdminPanel>
  );
}

function NewPostForm({
  onSubmit,
  pending,
}: {
  onSubmit: (body: string) => void;
  pending: boolean;
}) {
  const [body, setBody] = useState("");

  return (
    <AdminPanel title="Share with the community" description="Posts are reviewed before going live.">
      <div className="space-y-3">
        <Textarea
          placeholder="Share a tip, a win, or a question with the Mendanize community…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{body.length}/2000</span>
          <Button
            size="sm"
            onClick={() => { onSubmit(body); setBody(""); }}
            disabled={!body.trim() || pending}
          >
            Post
          </Button>
        </div>
      </div>
    </AdminPanel>
  );
}

export function CommunityView({ posts }: { posts: CommunityPostRecord[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handlePost(body: string) {
    startTransition(async () => {
      const res = await createCommunityPostAction(body);
      if (res.ok) {
        toast.success("Post submitted for review. It will appear once approved.");
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="Community"
        description="Connect with other Mendanize learners. Share progress, ask questions, and celebrate wins."
      />

      <NewPostForm onSubmit={handlePost} pending={pending} />

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Users className="size-4" />
          Community feed
        </h2>

        {posts.length === 0 ? (
          <AdminEmptyState
            title="Be the first to post"
            description="No community posts yet. Share something to get the conversation started."
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <AdminPanel title="Community guidelines">
        <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>Be kind and respectful to fellow learners.</li>
          <li>Share knowledge, not exam answers or harmful content.</li>
          <li>Posts are reviewed by the Mendanize team before appearing here.</li>
        </ul>
      </AdminPanel>
    </div>
  );
}
