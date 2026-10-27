import { NextRequest, NextResponse } from "next/server";

const PUMPGTM_DEFAULT_WEBHOOK_URL =
    "https://app.pumpgtm.com/api/v1/plays/53018427-bbc0-43a7-bfad-d3fdd9806e90/webhook";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const {
            name,
            email,
            company,
            title,
            linkedinUrl,
            xUsername,
            dryRun = false,
            eventId
        } = body;

        if (!email && !linkedinUrl && !xUsername) {
            return NextResponse.json(
                { error: "Email or social profile (linkedinUrl / xUsername) is required." },
                { status: 400 }
            );
        }

        const apiKey = process.env.PUMPGTM_API_KEY;
        const webhookUrl = process.env.PUMPGTM_WEBHOOK_URL || PUMPGTM_DEFAULT_WEBHOOK_URL;

        if (!apiKey) {
            console.warn("[PumpGTM] Warning: PUMPGTM_API_KEY environment variable is not set.");
            return NextResponse.json(
                {
                    error: "PUMPGTM_API_KEY is not configured on the server. Please add PUMPGTM_API_KEY to your environment variables.",
                    configured: false
                },
                { status: 401 }
            );
        }

        // Generate unique deterministic/sequential eventId if not provided
        const finalEventId =
            eventId || `signup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const payload: Record<string, any> = {
            eventId: finalEventId,
            expectedRevision: 1,
            name: name || undefined,
            email: email || undefined,
            company: company || undefined,
            title: title || undefined,
            linkedinUrl: linkedinUrl || undefined,
            xUsername: xUsername || undefined,
            dryRun: Boolean(dryRun)
        };

        // Remove undefined fields
        Object.keys(payload).forEach(
            (key) => payload[key] === undefined && delete payload[key]
        );

        console.log(`[PumpGTM] Sending event ${finalEventId} (dryRun=${payload.dryRun}) for ${email || name}`);

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            console.error(`[PumpGTM Webhook Error] Status ${response.status}:`, data);
            return NextResponse.json(
                { error: "PumpGTM webhook returned an error", status: response.status, details: data },
                { status: response.status }
            );
        }

        console.log(`[PumpGTM] Successfully delivered event ${finalEventId}`);
        return NextResponse.json({ success: true, eventId: finalEventId, data });
    } catch (err: any) {
        console.error("[PumpGTM Error]:", err);
        return NextResponse.json(
            { error: "Internal server error dispatching PumpGTM event", message: err.message },
            { status: 500 }
        );
    }
}

// GET endpoint allows testing the webhook from browser or health checks
export async function GET(req: NextRequest) {
    const isConfigured = Boolean(process.env.PUMPGTM_API_KEY);
    const webhookUrl = process.env.PUMPGTM_WEBHOOK_URL || PUMPGTM_DEFAULT_WEBHOOK_URL;

    const url = new URL(req.url);
    const test = url.searchParams.get("test");

    if (test === "true") {
        if (!isConfigured) {
            return NextResponse.json({
                configured: false,
                message: "Cannot run test: PUMPGTM_API_KEY is not configured in environment variables."
            });
        }

        // Perform test dry-run
        try {
            const testPayload = {
                eventId: `test_${Date.now()}`,
                expectedRevision: 1,
                name: "Test Lead",
                email: "test-signup@beraxis.online",
                company: "Beraxis Test",
                dryRun: true
            };

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.PUMPGTM_API_KEY?.trim()}`
                },
                body: JSON.stringify(testPayload)
            });

            const data = await response.json().catch(() => ({}));
            return NextResponse.json({
                configured: true,
                status: response.status,
                success: response.ok,
                testPayload,
                pumpGtmResponse: data
            });
        } catch (e: any) {
            return NextResponse.json({
                configured: true,
                error: e.message
            }, { status: 500 });
        }
    }

    return NextResponse.json({
        service: "PumpGTM Webhook Integration",
        status: "ready",
        configured: isConfigured,
        webhookUrl
    });
}
