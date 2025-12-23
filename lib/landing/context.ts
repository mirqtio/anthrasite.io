/**
 * Landing Page Context Functions
 * Handles token validation and context lookup for /landing/[token]
 */

import { validatePurchaseToken } from "@/lib/purchase";
import type { LandingContext } from "./types";

export { validatePurchaseToken };

/**
 * Looks up landing page context from validated token payload.
 * Fetches lead, report, and opportunity data to construct the landing context.
 *
 * @param leadId - Lead identifier from validated token
 * @param runId - Optional run identifier for specific report version
 * @returns LandingContext or null if not found
 */
export async function lookupLandingContext(
  leadId: string,
  runId?: string
): Promise<LandingContext | null> {
  // TODO: Replace with real API call to backend
  // This shape-correct stub matches the LandingContext interface
  // Backend team will implement the actual data fetching

  return {
    // Company info
    company: "Anthrasite",
    domainUrl: "anthrasite.com",

    // Score & impact (from reports.report_data)
    score: 74,
    issueCount: 7,
    impactLow: "$41,700",
    impactHigh: "$62,500",

    // Hook opportunity (from cold email selection + opportunity catalog)
    hookOpportunity: {
      title:
        "Complete Google Business Profile to strengthen local search presence",
      effort: "EASY",
      description:
        "While a Google Business Profile was found for your business, key information is missing that could be costing you visibility in local search results. Completing your profile is one of the highest-impact, lowest-effort improvements you can make.",
      anchorMetric: {
        label: "Profile Completeness",
        value: "40%",
        target: "85%",
      },
    },

    // Screenshots (from LeadShop API)
    // Using picsum.photos for reliable placeholder images with proper dimensions
    desktopScreenshotUrl: "https://picsum.photos/1440/900",
    mobileScreenshotUrl: "https://picsum.photos/375/812",

    // Purchase info
    price: 199,
    leadId: leadId,
    businessId: `business-${leadId}`,
  };
}
