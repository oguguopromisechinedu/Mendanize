/**
 * Database query helpers and types
 * Provides typed queries and common database operations
 */

import type {
  Post,
  Category,
  Tag,
  Subscriber,
  Admin,
  PostTag,
} from '@prisma/client'

export type PostWithRelations = Post & {
  author: Admin
  category: Category | null
  postTags: (PostTag & { tag: Tag })[]
}

export type CategoryWithPostCount = Category & {
  posts: { id: string }[]
}

export type TagWithPostCount = Tag & {
  postTags: { postId: string }[]
}

export type SubscriberData = Subscriber

/**
 * Pagination helper
 */
export function getPaginationParams(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit
  return { skip, take: limit }
}

/**
 * Slug generation
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * URL-friendly slug validation
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug)
}

/**
 * Extract reading time estimate (words / 200 wpm)
 */
export function getReadingTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / 200)
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, length: number = 150): string {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

/**
 * Format date for display
 */
export function formatDate(date: Date | null): string {
  if (!date) return 'Not published'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Check if user is author of post
 */
export function isPostAuthor(userId: string, post: PostWithRelations): boolean {
  return post.author.id === userId
}

/**
 * Get excerpt or generate from content
 */
export function getExcerpt(post: Post & { excerpt?: string }): string {
  if (post.excerpt) return post.excerpt
  const stripped = post.content
    .replace(/<[^>]*>/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\n+/g, ' ')
  return truncateText(stripped, 160)
}
