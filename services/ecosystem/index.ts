/**
 * Ecosystem service barrel — Learner ↔ Admin catalog.
 * MES-learner-admin-ecosystem
 */

export {
  listPublishedPromptPacks,
  getPublishedPromptPackBySlug,
  submitPromptPackReview,
  listPublishedProjectTemplates,
  listLearnerProjects,
  listLearnerCertificates,
  startLearnerProject,
  updateLearnerProjectStatus,
  listPublishedWorkspacePresets,
  getFeaturedSetting,
  listCommunityFeed,
  createCommunityPost,
  markDailyActivity,
  generateCredentialCode,
  // Admin — Prompt Packs
  adminListPromptPacks,
  adminGetPromptPack,
  adminCreatePromptPack,
  adminUpdatePromptPack,
  adminPublishPromptPack,
  adminArchivePromptPack,
  adminDeletePromptPack,
  adminCreatePromptPackItem,
  adminUpdatePromptPackItem,
  adminDeletePromptPackItem,
  // Admin — Project Templates
  adminListProjectTemplates,
  adminCreateProjectTemplate,
  adminUpdateProjectTemplate,
  adminPublishProjectTemplate,
  adminDeleteProjectTemplate,
  // Admin — Certificate Templates
  adminListCertificateTemplates,
  adminCreateCertificateTemplate,
  adminUpdateCertificateTemplate,
  adminPublishCertificateTemplate,
  adminDeleteCertificateTemplate,
  // Admin — Featured Learning
  adminGetFeaturedSetting,
  adminUpdateFeaturedSetting,
  // Admin — Workspace Presets
  adminListWorkspacePresets,
  adminCreateWorkspacePreset,
  adminUpdateWorkspacePreset,
  adminPublishWorkspacePreset,
  adminDeleteWorkspacePreset,
} from "./service";

export type {
  PromptPackRecord,
  PromptPackItemRecord,
  ProjectTemplateRecord,
  LearnerProjectRecord,
  CertificateTemplateRecord,
  CertificateRecord,
  FeaturedSettingRecord,
  WorkspacePresetRecord,
  CommunityPostRecord,
  CreatePromptPackInput,
  UpdatePromptPackInput,
  CreatePromptPackItemInput,
  UpdatePromptPackItemInput,
  CreateProjectTemplateInput,
  UpdateProjectTemplateInput,
  CreateCertificateTemplateInput,
  UpdateCertificateTemplateInput,
  UpdateFeaturedSettingInput,
  CreateWorkspacePresetInput,
  UpdateWorkspacePresetInput,
  CreateCommunityPostInput,
  UpdateLearnerProjectInput,
} from "./types";
