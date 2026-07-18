/**
 * Feature orchestration for the public homepage (MES-005).
 * Calls Shared Services — does not own content persistence.
 */

import { getHomepageContent as getContentHomepage } from "@/services/content/homepage";
import type { HomepageContent } from "../types/types";

export { visibleSections } from "../utils/visible-sections";

export async function loadHomepage(preview = false): Promise<HomepageContent> {
  return getContentHomepage({ preview });
}
