/**
 * Landing Page Hooks from Opportunity Catalog
 * Pre-written deterministic copy for each opportunity ID
 * Source: opportunity_catalog_v1.4.yaml
 */

export const CATALOG_HOOKS: Record<string, string> = {
  speed:
    "Your site's biggest issue is slow page loading. This lowers your search rank and drives visitors away before they even see your message. Many factors can slow down your site. The report explains which ones are affecting its performance.",

  mobile:
    "Your site's biggest issue is that it is hard to use on phones, making it difficult for mobile visitors to take action. Many factors impact mobile experience. The report explains which ones are affecting your site.",

  local_search:
    "Your site's biggest issue is that local customers can't easily find your business. Local results show above regular search results. The report shows you what is making your site hard to find.",

  indexability:
    "Your site's biggest issue is that it's hard for search engines like Google to fully understand. Many factors impact how easy your site is to index. The report explains which ones are affecting your site.",

  search_snippets:
    "Your site's biggest issue is that your search listing doesn't clearly show what you offer. Because of this, people skip over it. Most people find sites like yours through search. The report explains what is causing your listing to miss the mark.",

  ssl_encryption:
    "Your site's biggest issue is that it doesn't clearly show it's secure, which can scare visitors away. Web security is complicated. The report shows which issues are affecting your site.",

  security_headers:
    "Your site's biggest issue is that it lacks some protections that help prevent security issues. Web security is complicated. The report shows which issues are affecting your site.",

  social_proof:
    "Your site's biggest issue is that visitors don't see proof that others trust or choose your business. Trust is the most important factor when people are choosing a business to work with. The report explains exactly what is affecting your site.",

  value_proposition:
    "Your site's biggest issue is that it is not immediately clear what you do or why someone should choose you. Most people decide if a business meets their needs in seconds. The report shows how this impacts your site.",

  content_presentation:
    "Your site's biggest issue is that your content is hard to read quickly and understand, so key points get missed. Most people decide if a business meets their needs in seconds. The report shows how this impacts your site.",

  accessibility:
    "Your site's biggest issue is that some visitors may struggle to use it due to accessibility barriers. Making your site accessible helps your users and your business. The report shows how this impacts your site.",

  contact_conversion:
    "Your site's biggest issue is that it is not obvious how to contact you or take the next step. Most people will find an alternative if it isn't clear how to engage with your business. The report shows how this impacts your site.",
}

/** Catalog titles for each opportunity */
export const CATALOG_TITLES: Record<string, string> = {
  speed: 'Speed Up Page Load Times',
  mobile: 'Improve Mobile Experience',
  local_search: 'Strengthen Local Search Presence',
  indexability: 'Fix Technical SEO Issues',
  search_snippets: 'Optimize Search Snippets',
  ssl_encryption: 'Secure Your Site with HTTPS',
  security_headers: 'Add Security Headers',
  social_proof: 'Build Social Proof',
  value_proposition: 'Clarify Your Value Proposition',
  content_presentation: 'Improve Content Presentation',
  accessibility: 'Improve Accessibility',
  contact_conversion: 'Make Contact Options Prominent',
}

/** Default hook when no friction points found */
export const DEFAULT_HOOK =
  "We found several issues that may be affecting your website's performance and visibility. The report explains exactly what we found and how it impacts your business."
