import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { validatePurchaseToken } from "@/lib/landing/context";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, leadId, token } = body;

    // Validate required fields
    if (!businessId || !leadId || !token) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate token
    const payload = await validatePurchaseToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get base URL for redirect URLs
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Create Stripe checkout session
    const session = await createCheckoutSession({
      businessId,
      utmToken: token,
      leadId,
      baseUrl,
    });

    // Return the checkout URL for redirect
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("[checkout/create-session] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
