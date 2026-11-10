import React from "react";

export function VisaLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <img
            src="/images/payments/visa.png"
            alt="Visa"
            className={`${className} object-contain rounded-md shadow-sm border border-white/10 hover:border-white/30 transition-all select-none`}
            loading="lazy"
            draggable={false}
        />
    );
}

export function MastercardLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <img
            src="/images/payments/mastercard.png"
            alt="Mastercard"
            className={`${className} object-contain rounded-md shadow-sm border border-white/10 hover:border-white/30 transition-all select-none`}
            loading="lazy"
            draggable={false}
        />
    );
}

export function AmexLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <img
            src="/images/payments/amex.png"
            alt="American Express"
            className={`${className} object-contain rounded-md shadow-sm border border-white/10 hover:border-white/30 transition-all select-none`}
            loading="lazy"
            draggable={false}
        />
    );
}

export function ApplePayLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <img
            src="/images/payments/apple-pay.png"
            alt="Apple Pay"
            className={`${className} object-contain rounded-md shadow-sm border border-white/10 hover:border-white/30 transition-all select-none`}
            loading="lazy"
            draggable={false}
        />
    );
}

export function GooglePayLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <img
            src="/images/payments/google-pay.png"
            alt="Google Pay"
            className={`${className} object-contain rounded-md shadow-sm border border-white/10 hover:border-white/30 transition-all select-none`}
            loading="lazy"
            draggable={false}
        />
    );
}

export function PayPalLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <img
            src="/images/payments/paypal.png"
            alt="PayPal"
            className={`${className} object-contain rounded-md shadow-sm border border-white/10 hover:border-white/30 transition-all select-none`}
            loading="lazy"
            draggable={false}
        />
    );
}

export function DiscoverLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <img
            src="/images/payments/discover.png"
            alt="Discover"
            className={`${className} object-contain rounded-md shadow-sm border border-white/10 hover:border-white/30 transition-all select-none`}
            loading="lazy"
            draggable={false}
        />
    );
}

export default function PaymentLogos({
    className = "",
    title = "Supported Payment Methods",
    showTitle = true,
    compact = false
}: {
    className?: string;
    title?: string;
    showTitle?: boolean;
    compact?: boolean;
}) {
    const sizeClass = compact ? "h-6 sm:h-6.5 w-auto" : "h-7 sm:h-8 w-auto";

    return (
        <div className={`flex flex-col sm:flex-row items-center gap-3 ${className}`}>
            {showTitle && (
                <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 shrink-0">
                    {title}:
                </span>
            )}
            <div className={`flex items-center flex-wrap justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
                <div title="Apple Pay" className="hover:scale-105 transition-transform duration-150 drop-shadow-sm">
                    <ApplePayLogo className={sizeClass} />
                </div>
                <div title="Google Pay" className="hover:scale-105 transition-transform duration-150 drop-shadow-sm">
                    <GooglePayLogo className={sizeClass} />
                </div>
                <div title="Visa" className="hover:scale-105 transition-transform duration-150 drop-shadow-sm">
                    <VisaLogo className={sizeClass} />
                </div>
                <div title="Mastercard" className="hover:scale-105 transition-transform duration-150 drop-shadow-sm">
                    <MastercardLogo className={sizeClass} />
                </div>
                <div title="American Express" className="hover:scale-105 transition-transform duration-150 drop-shadow-sm">
                    <AmexLogo className={sizeClass} />
                </div>
                <div title="Discover" className="hover:scale-105 transition-transform duration-150 drop-shadow-sm">
                    <DiscoverLogo className={sizeClass} />
                </div>
                <div title="PayPal" className="hover:scale-105 transition-transform duration-150 drop-shadow-sm">
                    <PayPalLogo className={sizeClass} />
                </div>
            </div>
        </div>
    );
}
