import "./load-env";
import bcrypt from "bcryptjs";
import type { AdminRoleKey, PrismaClient } from "@prisma/client";
import { getPrisma } from "../lib/db/prisma";

const prisma = getPrisma();

const PERMISSION_DEFS = [
  { key: "dashboard.access", name: "Dashboard access" },
  { key: "users.manage", name: "Manage admins & roles" },
  { key: "content.manage", name: "Manage content" },
  { key: "settings.manage", name: "Manage platform settings" },
  { key: "analytics.view", name: "View analytics" },
  { key: "billing.view", name: "View billing overview" },
] as const;

const ROLE_DEFS: Array<{
  key: AdminRoleKey;
  name: string;
  description: string;
  permissions: string[];
}> = [
  {
    key: "SUPER_ADMINISTRATOR",
    name: "Super Administrator",
    description: "Full platform access",
    permissions: PERMISSION_DEFS.map((p) => p.key),
  },
  {
    key: "ADMINISTRATOR",
    name: "Administrator",
    description: "Broad admin access without destructive identity ops",
    permissions: [
      "dashboard.access",
      "content.manage",
      "settings.manage",
      "analytics.view",
      "billing.view",
      "users.manage",
    ],
  },
  {
    key: "EDITOR",
    name: "Editor",
    description: "Create and publish educational content",
    permissions: ["dashboard.access", "content.manage"],
  },
  {
    key: "CONTENT_MANAGER",
    name: "Content Manager",
    description: "Content taxonomy and media",
    permissions: ["dashboard.access", "content.manage"],
  },
  {
    key: "ANALYTICS_MANAGER",
    name: "Analytics Manager",
    description: "Insights and reporting",
    permissions: ["dashboard.access", "analytics.view", "billing.view"],
  },
  {
    key: "SUPPORT_MANAGER",
    name: "Support Manager",
    description: "Support and communication",
    permissions: ["dashboard.access"],
  },
];

/** Seed AdminRole + Permission + RolePermission (idempotent). */
export async function seedAdminRbac(db: PrismaClient = prisma) {
  for (const perm of PERMISSION_DEFS) {
    await db.permission.upsert({
      where: { key: perm.key },
      update: { name: perm.name },
      create: { key: perm.key, name: perm.name },
    });
  }

  const permissionRows = await db.permission.findMany();
  const byKey = Object.fromEntries(permissionRows.map((p) => [p.key, p.id]));

  for (const role of ROLE_DEFS) {
    const row = await db.adminRole.upsert({
      where: { key: role.key },
      update: { name: role.name, description: role.description },
      create: {
        key: role.key,
        name: role.name,
        description: role.description,
      },
    });

    for (const key of role.permissions) {
      const permissionId = byKey[key];
      if (!permissionId) continue;
      await db.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: row.id, permissionId },
        },
        update: {},
        create: { roleId: row.id, permissionId },
      });
    }
  }
}

async function ensureAdmin(input: {
  email: string;
  name: string;
  roleKey: AdminRoleKey;
  password?: string;
}) {
  const role = await prisma.adminRole.findUnique({
    where: { key: input.roleKey },
  });
  if (!role) throw new Error(`Missing role ${input.roleKey}`);

  const passwordHash = input.password
    ? await bcrypt.hash(input.password, 12)
    : undefined;

  const existing = await prisma.admin.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    return prisma.admin.update({
      where: { email: input.email },
      data: {
        name: input.name,
        roleId: role.id,
        active: true,
        emailVerified: new Date(),
        ...(passwordHash ? { passwordHash } : {}),
      },
    });
  }

  return prisma.admin.create({
    data: {
      email: input.email,
      name: input.name,
      roleId: role.id,
      active: true,
      emailVerified: new Date(),
      passwordHash: passwordHash ?? (await bcrypt.hash("ChangeMe123!", 12)),
    },
  });
}

async function ensurePublicUser(input: {
  email: string;
  name: string;
  password?: string;
}) {
  const passwordHash = await bcrypt.hash(
    input.password ?? "Learner123!",
    12,
  );
  const existing = await prisma.publicUser.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    return prisma.publicUser.update({
      where: { email: input.email },
      data: {
        name: input.name,
        passwordHash,
        emailVerified: new Date(),
      },
    });
  }
  return prisma.publicUser.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
      emailVerified: new Date(),
      profile: { create: {} },
      subscription: { create: { plan: "FREE" } },
      settings: { create: {} },
    },
  });
}

async function seed() {
  console.log("[Seed] Starting MES-030 dual-auth seed...");

  await seedAdminRbac(prisma);
  console.log("✓ Admin RBAC roles & permissions");

  const adminUser = await ensureAdmin({
    email: "admin@mendanize.com",
    name: "Mendanize Admin",
    roleKey: "SUPER_ADMINISTRATOR",
    password: "MendanizeAdmin123!",
  });
  console.log("✓ Super Administrator:", adminUser.id);

  const learner = await ensurePublicUser({
    email: "learner@mendanize.com",
    name: "Sample Learner",
    password: "Learner123!",
  });
  console.log("✓ PublicUser learner:", learner.id);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "ai-fundamentals" },
      update: {},
      create: {
        name: "AI Fundamentals",
        slug: "ai-fundamentals",
        description:
          "Learn the basics of artificial intelligence and machine learning",
        icon: "🤖",
      },
    }),
    prisma.category.upsert({
      where: { slug: "content-creation" },
      update: {},
      create: {
        name: "Content Creation",
        slug: "content-creation",
        description: "Using AI to streamline content production",
        icon: "✍️",
      },
    }),
    prisma.category.upsert({
      where: { slug: "business-insights" },
      update: {},
      create: {
        name: "Business Insights",
        slug: "business-insights",
        description: "AI applications in modern business",
        icon: "💼",
      },
    }),
    prisma.category.upsert({
      where: { slug: "tutorials" },
      update: {},
      create: {
        name: "Tutorials",
        slug: "tutorials",
        description: "Step-by-step guides for AI tools",
        icon: "📚",
      },
    }),
  ]);
  console.log("✓ Created", categories.length, "categories");

  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "openai" },
      update: {},
      create: { name: "OpenAI", slug: "openai" },
    }),
    prisma.tag.upsert({
      where: { slug: "chatgpt" },
      update: {},
      create: { name: "ChatGPT", slug: "chatgpt" },
    }),
    prisma.tag.upsert({
      where: { slug: "machine-learning" },
      update: {},
      create: { name: "Machine Learning", slug: "machine-learning" },
    }),
    prisma.tag.upsert({
      where: { slug: "productivity" },
      update: {},
      create: { name: "Productivity", slug: "productivity" },
    }),
    prisma.tag.upsert({
      where: { slug: "automation" },
      update: {},
      create: { name: "Automation", slug: "automation" },
    }),
    prisma.tag.upsert({
      where: { slug: "writing" },
      update: {},
      create: { name: "Writing", slug: "writing" },
    }),
  ]);
  console.log("✓ Created", tags.length, "tags");

  const samplePosts = [
    {
      title: "Getting Started with AI: A Beginner's Guide",
      slug: "getting-started-with-ai-beginners-guide",
      excerpt:
        "Learn the fundamentals of artificial intelligence and how it's transforming the world.",
      content: `# Getting Started with AI: A Beginner's Guide

Artificial Intelligence (AI) has become one of the most transformative technologies of our time.

## What is Artificial Intelligence?

AI refers to computer systems designed to perform tasks that typically require human intelligence.`,
      categoryId: categories[0].id,
      tagIds: [tags[0].id, tags[2].id],
    },
  ];

  for (const post of samplePosts) {
    const { tagIds, ...data } = post;
    const created = await prisma.post.upsert({
      where: { slug: data.slug },
      update: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: adminUser.id,
        categoryId: data.categoryId,
      },
      create: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: adminUser.id,
        categoryId: data.categoryId,
      },
    });
    for (const tagId of tagIds) {
      await prisma.postTag.upsert({
        where: { postId_tagId: { postId: created.id, tagId } },
        update: {},
        create: { postId: created.id, tagId },
      });
    }
  }
  console.log("✓ Sample posts authored by Admin");

  console.log("[Seed] Done.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
