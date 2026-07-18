/** Public UI + actions — features/articles
 * Loaders: `@/features/articles/server`
 */

export {
  createArticleAction,
  updateArticleAction,
  deleteArticlesAction,
  bulkStatusAction,
  requestAiAssistAction,
} from "./actions/actions"

export { ArticleListView } from "./components/article-list-view"
export { ArticleEditorForm } from "./components/article-editor-form"
export { ArticlePreviewView } from "./components/article-preview-view"
export { ArticleRichTextEditor } from "./components/article-rich-text-editor"

export { ArticleReadingView } from "./components/public/article-reading-view"
export { PublicArticleListView } from "./components/public/public-article-list-view"
export { ReadingProgressBar } from "./components/public/reading-progress-bar"
export { prepareArticleHtml } from "./utils/toc"

export {
  articleWriteSchema,
  articleListQuerySchema,
} from "./validators/schema"

export type {
  ArticleRecord,
  ArticleListResult,
  ArticleEditorOptions,
  ActionResult,
} from "./types/types"
