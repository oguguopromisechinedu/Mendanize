import {
  buildRobotsTxt,
  getGlobalSEOSettings,
  getSeoDashboardStats,
  listMetadataTemplates,
  listRedirects,
  listRobotsRules,
  listSitemapConfigs,
  listStructuredData,
} from "@/services/seo"

export async function loadSeoDashboard() {
  return getSeoDashboardStats()
}

export async function loadSeoSettings() {
  return getGlobalSEOSettings()
}

export async function loadSeoTemplates() {
  return listMetadataTemplates()
}

export async function loadRedirects() {
  return listRedirects()
}

export async function loadRobots() {
  const [rules, settings] = await Promise.all([
    listRobotsRules(),
    getGlobalSEOSettings(),
  ])
  const sitemapUrl = settings.canonicalDomain
    ? `${settings.canonicalDomain.replace(/\/$/, "")}/sitemap.xml`
    : null
  return {
    rules,
    preview: buildRobotsTxt(rules, sitemapUrl),
  }
}

export async function loadSitemap() {
  return listSitemapConfigs()
}

export async function loadStructuredData() {
  return listStructuredData()
}
