import { getPrisma } from './prisma'
import type { Post, Category, Tag, Subscriber, PostStatus } from '@prisma/client'

/**
 * Blog Repository - handles all blog-related database operations
 */

// ============ POST OPERATIONS ============

export async function createPost(data: {
  title: string
  slug: string
  content: string
  authorId: string
  categoryId?: string
  excerpt?: string
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  status?: PostStatus
}) {
  const prisma = getPrisma()
  return prisma.post.create({
    data,
    include: {
      author: true,
      category: true,
      postTags: {
        include: { tag: true },
      },
    },
  })
}

export async function getPostBySlug(slug: string) {
  const prisma = getPrisma()
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      postTags: {
        include: { tag: true },
      },
    },
  })
}

export async function getPostById(id: string) {
  const prisma = getPrisma()
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      postTags: {
        include: { tag: true },
      },
    },
  })
}

export async function updatePost(id: string, data: Partial<Post>) {
  const prisma = getPrisma()
  return prisma.post.update({
    where: { id },
    data,
    include: {
      author: true,
      category: true,
      postTags: {
        include: { tag: true },
      },
    },
  })
}

export async function deletePost(id: string) {
  const prisma = getPrisma()
  // Delete associated tags first
  await prisma.postTag.deleteMany({
    where: { postId: id },
  })
  return prisma.post.delete({
    where: { id },
  })
}

export async function getPublishedPosts(limit = 10, skip = 0) {
  const prisma = getPrisma()
  return prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: true,
      category: true,
      postTags: {
        include: { tag: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    skip,
  })
}

export async function getPostsByAuthor(authorId: string, limit = 10, skip = 0) {
  const prisma = getPrisma()
  return prisma.post.findMany({
    where: { authorId },
    include: {
      author: true,
      category: true,
      postTags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip,
  })
}

export async function getPostsByCategory(categoryId: string, limit = 10, skip = 0) {
  const prisma = getPrisma()
  return prisma.post.findMany({
    where: { categoryId },
    include: {
      author: true,
      category: true,
      postTags: {
        include: { tag: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    skip,
  })
}

export async function incrementPostViews(postId: string) {
  const prisma = getPrisma()
  return prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  })
}

// ============ CATEGORY OPERATIONS ============

export async function createCategory(data: {
  name: string
  slug: string
  description?: string
  icon?: string
}) {
  const prisma = getPrisma()
  return prisma.category.create({ data })
}

export async function getCategories() {
  const prisma = getPrisma()
  return prisma.category.findMany({
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        select: { id: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getCategoryBySlug(slug: string) {
  const prisma = getPrisma()
  return prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        include: { author: true },
      },
    },
  })
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const prisma = getPrisma()
  return prisma.category.update({
    where: { id },
    data,
  })
}

export async function deleteCategory(id: string) {
  const prisma = getPrisma()
  return prisma.category.delete({
    where: { id },
  })
}

// ============ TAG OPERATIONS ============

export async function createTag(data: {
  name: string
  slug: string
}) {
  const prisma = getPrisma()
  return prisma.tag.create({ data })
}

export async function getTags() {
  const prisma = getPrisma()
  return prisma.tag.findMany({
    include: {
      postTags: {
        select: { postId: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getTagBySlug(slug: string) {
  const prisma = getPrisma()
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      postTags: true,
    },
  })

  if (!tag) return null

  // Manually fetch posts for this tag
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      postTags: {
        some: { tagId: tag.id },
      },
    },
    include: { author: true },
  })

  return { ...tag, postTags: posts }
}

export async function updateTag(id: string, data: Partial<Tag>) {
  const prisma = getPrisma()
  return prisma.tag.update({
    where: { id },
    data,
  })
}

export async function deleteTag(id: string) {
  const prisma = getPrisma()
  return prisma.tag.delete({
    where: { id },
  })
}

// ============ POST-TAG OPERATIONS ============

export async function addTagToPost(postId: string, tagId: string) {
  const prisma = getPrisma()
  return prisma.postTag.create({
    data: { postId, tagId },
  })
}

export async function removeTagFromPost(postId: string, tagId: string) {
  const prisma = getPrisma()
  return prisma.postTag.delete({
    where: { postId_tagId: { postId, tagId } },
  })
}

export async function addTagsToPost(postId: string, tagIds: string[]) {
  const prisma = getPrisma()
  // Remove existing tags
  await prisma.postTag.deleteMany({
    where: { postId },
  })
  // Add new tags
  return prisma.postTag.createMany({
    data: tagIds.map(tagId => ({ postId, tagId })),
  })
}

// ============ SUBSCRIBER OPERATIONS ============

export async function createSubscriber(data: {
  email: string
  name?: string
  categories?: string[]
}) {
  const prisma = getPrisma()
  return prisma.subscriber.create({ data })
}

export async function getSubscriberByEmail(email: string) {
  const prisma = getPrisma()
  return prisma.subscriber.findUnique({
    where: { email },
  })
}

export async function updateSubscriber(id: string, data: Partial<Subscriber>) {
  const prisma = getPrisma()
  return prisma.subscriber.update({
    where: { id },
    data,
  })
}

export async function deleteSubscriber(id: string) {
  const prisma = getPrisma()
  return prisma.subscriber.delete({
    where: { id },
  })
}

export async function getActiveSubscribers() {
  const prisma = getPrisma()
  return prisma.subscriber.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSubscribersByCategory(category: string) {
  const prisma = getPrisma()
  return prisma.subscriber.findMany({
    where: {
      status: 'active',
      categories: {
        has: category,
      },
    },
  })
}

// ============ SEARCH & ANALYTICS ============

export async function searchPosts(query: string, limit = 10) {
  const prisma = getPrisma()
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      author: true,
      category: true,
    },
    take: limit,
  })
}

export async function getTopPosts(limit = 5) {
  const prisma = getPrisma()
  return prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      author: true,
      category: true,
    },
    orderBy: { viewCount: 'desc' },
    take: limit,
  })
}

export async function getPostStats() {
  const prisma = getPrisma()
  const [totalPosts, publishedPosts, draftPosts, totalViews] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.post.aggregate({
      _sum: { viewCount: true },
    }),
  ])

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews: totalViews._sum.viewCount || 0,
  }
}
