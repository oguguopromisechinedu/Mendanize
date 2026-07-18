/** Public exports — features/categories-topics (MES-009) */

export {
  createCategoryAction,
  updateCategoryAction,
  createTopicAction,
  updateTopicAction,
  deleteCategoriesAction,
  deleteTopicsAction,
  bulkCategoryStatusAction,
  bulkTopicStatusAction,
} from "./actions/actions"

export {
  loadCategoryList,
  loadTopicList,
  loadCategoryEditor,
  loadTopicEditor,
  loadCategoryDetails,
  loadTopicDetails,
} from "./services/service"

export { CategoryListView } from "./components/category-list-view"
export { TopicListView } from "./components/topic-list-view"
export { CategoryEditorForm } from "./components/category-editor-form"
export { TopicEditorForm } from "./components/topic-editor-form"
export { CategoryDetailView, TopicDetailView } from "./components/detail-views"

export { PublicCategoryListView } from "./components/public/public-category-list-view"
export { PublicCategoryDetailView } from "./components/public/public-category-detail-view"
export { PublicTopicListView } from "./components/public/public-topic-list-view"
export { PublicTopicDetailView } from "./components/public/public-topic-detail-view"
export { PublicLearnView } from "./components/public/public-learn-view"

export type {
  CategoryRecord,
  TopicRecord,
  CategoryDetail,
  TopicDetail,
  ActionResult,
} from "./types/types"
