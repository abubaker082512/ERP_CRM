"use client";

/**
 * Stripe Integration Helper
 * In a real production app, you would use @stripe/stripe-js
 * and redirect to a Stripe-hosted checkout page.
 */

export const createCheckoutSession = async (priceId: string) => {
    try {
        // This would call your backend endpoint /api/v1/billing/create-checkout-session
        const response = await fetch("/api/v1/billing/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ priceId })
        });

        if (response.ok) {
            const { url } = await response.json();
            window.location.href = url; // Redirect to Stripe
        } else {
            console.error("Failed to create checkout session");
            alert("Payment gateway is currently offline. Please try again later.");
        }
    } catch (err) {
        console.error("Stripe error:", err);
    }
};

export const PRICES = {
    BASIC: "price_basic_id",
    PREMIUM: "price_premium_id"
};
