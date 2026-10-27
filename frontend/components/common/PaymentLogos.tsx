import React from "react";

export function VisaLogo({ className = "h-5 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
            <rect width="48" height="32" rx="4" fill="#0A0F1D" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <path
                d="M19.46 21.5h-2.58l1.61-9.98h2.58l-1.61 9.98zm11.23-9.74c-.51-.2-1.32-.42-2.33-.42-2.56 0-4.37 1.36-4.39 3.31-.02 1.44 1.29 2.24 2.27 2.72 1.01.49 1.35.81 1.35 1.25 0 .68-.81.99-1.57.99-1.05 0-1.61-.16-2.47-.54l-.34-.16-.37 2.29c.62.28 1.76.53 2.94.54 2.72 0 4.49-1.34 4.51-3.42.02-1.14-.68-2.01-2.17-2.73-.9-.46-1.46-.77-1.46-1.24 0-.42.47-.86 1.48-.86.84-.02 1.46.18 1.93.38l.23.11.37-2.38zm7.39 6.27l1.24-3.37.71 3.37h-1.95zm2.89-6.51h-2c-.62 0-1.09.18-1.36.83l-3.87 9.15h2.71l.54-1.5h3.31l.31 1.5h2.39l-2.03-9.98zm-11.85 0l-2.03 6.82-.22-1.1c-.38-1.31-1.58-2.74-2.92-3.45l2.36 8.71h2.72l4.05-9.98h-3.96z"
                fill="#FFFFFF"
            />
            <path
                d="M13.68 11.52H9.6L9.56 11.7c3.16.81 5.25 2.76 6.11 5.09l-.88-4.48c-.15-.62-.6-.77-1.11-.79z"
                fill="#F7B600"
            />
        </svg>
    );
}

export function MastercardLogo({ className = "h-5 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
            <rect width="48" height="32" rx="4" fill="#0A0F1D" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <circle cx="19" cy="16" r="8" fill="#EB001B" />
            <circle cx="29" cy="16" r="8" fill="#F79E1B" fillOpacity="0.9" />
            <path
                d="M24 10.4a7.96 7.96 0 013 5.6 7.96 7.96 0 01-3 5.6 7.96 7.96 0 01-3-5.6c0-2.18 1.15-4.1 3-5.6z"
                fill="#FF5F00"
            />
        </svg>
    );
}

export function AmexLogo({ className = "h-5 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="American Express">
            <rect width="48" height="32" rx="4" fill="#006FCF" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <path
                d="M8 12.5h3.2l1.6 3.7 1.6-3.7h3.2v7h-2.1v-4.5l-1.8 4.5h-1.9l-1.8-4.5v4.5H8v-7zm10.5 0h6.8v1.6h-4.8v1.1h4.5v1.6h-4.5v1.2h4.9v1.5h-6.9v-7zm8.2 0h2.4l1.8 2.6 1.8-2.6h2.4l-2.9 3.5 3 3.5h-2.4l-1.9-2.7-1.9 2.7h-2.4l3-3.5-2.9-3.5z"
                fill="#FFFFFF"
            />
        </svg>
    );
}

export function ApplePayLogo({ className = "h-5 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Apple Pay">
            <rect width="48" height="32" rx="4" fill="#000000" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            {/* Apple Leaf & Body */}
            <path
                d="M17.48 13.06c-.34.41-.88.72-1.42.68-.07-.53.16-1.07.47-1.45.34-.41.91-.71 1.41-.69.05.53-.13 1.05-.46 1.46zm.45.74c-.79-.05-1.46.46-1.84.46-.38 0-.96-.44-1.58-.43-.81.01-1.57.48-1.98 1.21-.85 1.47-.22 3.65.6 4.84.4.58.88 1.23 1.51 1.2 0.6-.02.83-.39 1.56-.39.73 0 .93.39 1.56.38.64-.01 1.05-.58 1.44-1.16.46-.67.65-1.32.66-1.35-.01-.03-1.27-.49-1.28-1.93-.01-1.21.99-1.78 1.04-1.82-.57-.83-1.45-.92-1.69-.95z"
                fill="#FFFFFF"
            />
            {/* "Pay" Text */}
            <path
                d="M23.1 12.8h2.64c1.47 0 2.37.88 2.37 2.19 0 1.34-.94 2.22-2.39 2.22h-1.38v2.74H23.1V12.8zm2.53 3.2c.76 0 1.23-.42 1.23-1.03 0-.6-.46-1.01-1.23-1.01h-1.29V16h1.29zm4.27 2.27c0-1.12.87-1.79 2.4-1.87l1.55-.09v-.48c0-.62-.43-.99-1.22-.99-.68 0-1.14.28-1.25.75h-1.18c.11-.97.97-1.63 2.45-1.63 1.54 0 2.42.75 2.42 1.95v3.98h-1.22v-.92c-.37.62-1.06.98-1.89.98-1.28 0-2.06-.75-2.06-1.88zm3.95-.53v-.61l-1.41.09c-.83.05-1.3.4-1.3.97 0 .57.45.92 1.15.92.93 0 1.56-.56 1.56-1.37zm3.17 3.52l1.62-4.57-1.37-3.89h1.34l.76 2.5 0.77-2.5h1.31l-2.92 7.02c-.37.88-.86 1.14-1.72 1.14h-.77v-.89h.43c.42 0 .68-.13.85-.54v-.27z"
                fill="#FFFFFF"
            />
        </svg>
    );
}

export function GooglePayLogo({ className = "h-5 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Google Pay">
            <rect width="48" height="32" rx="4" fill="#0A0F1D" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            {/* G Logo */}
            <path
                d="M17.15 16.14c0-.36-.03-.7-.09-1.03H12v2.07h2.89c-.12.67-.5 1.24-1.07 1.62v1.35h1.73c1.01-.93 1.6-2.3 1.6-4.01z"
                fill="#4285F4"
            />
            <path
                d="M12 21.37c1.45 0 2.67-.48 3.56-1.3l-1.73-1.35c-.48.32-1.1.51-1.83.51-1.41 0-2.6-1.02-3.03-2.38H7.17v1.39c.89 1.76 2.71 3.13 4.83 3.13z"
                fill="#34A853"
            />
            <path
                d="M8.97 16.85c-.11-.33-.17-.68-.17-1.04s.06-.71.17-1.04V13.38H7.17C6.8 14.12 6.59 14.95 6.59 15.81s.21 1.69.58 2.43l1.8-1.39z"
                fill="#FBBC05"
            />
            <path
                d="M12 10.25c.79 0 1.5.27 2.06.8l1.55-1.55C14.67 8.63 13.45 8.12 12 8.12c-2.12 0-3.94 1.37-4.83 3.13l1.8 1.39c.43-1.36 1.62-2.39 3.03-2.39z"
                fill="#EA4335"
            />
            {/* "Pay" */}
            <path
                d="M21.2 12.8h2.64c1.47 0 2.37.88 2.37 2.19 0 1.34-.94 2.22-2.39 2.22h-1.38v2.74H21.2V12.8zm2.53 3.2c.76 0 1.23-.42 1.23-1.03 0-.6-.46-1.01-1.23-1.01h-1.29V16h1.29zm4.27 2.27c0-1.12.87-1.79 2.4-1.87l1.55-.09v-.48c0-.62-.43-.99-1.22-.99-.68 0-1.14.28-1.25.75h-1.18c.11-.97.97-1.63 2.45-1.63 1.54 0 2.42.75 2.42 1.95v3.98h-1.22v-.92c-.37.62-1.06.98-1.89.98-1.28 0-2.06-.75-2.06-1.88zm3.95-.53v-.61l-1.41.09c-.83.05-1.3.4-1.3.97 0 .57.45.92 1.15.92.93 0 1.56-.56 1.56-1.37zm3.17 3.52l1.62-4.57-1.37-3.89h1.34l.76 2.5 0.77-2.5h1.31l-2.92 7.02c-.37.88-.86 1.14-1.72 1.14h-.77v-.89h.43c.42 0 .68-.13.85-.54v-.27z"
                fill="#FFFFFF"
            />
        </svg>
    );
}

export function DiscoverLogo({ className = "h-5 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Discover">
            <rect width="48" height="32" rx="4" fill="#0A0F1D" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <path
                d="M8.5 13.5h2.8c1.5 0 2.5.9 2.5 2.5s-1 2.5-2.5 2.5H8.5v-5zm1.5 3.8h1.2c.7 0 1.2-.4 1.2-1.3s-.5-1.3-1.2-1.3H10v2.6zm5 1.2v-5h1.4v5H15zm3-5h3v1.2h-1.6v.7h1.4v1.1h-1.4v.8h1.7v1.2H18v-5zm5.5 3.8c.4.3.9.4 1.4.4.6 0 1-.2 1-.6 0-.9-2.5-.4-2.5-2.1 0-1 .8-1.6 2.2-1.6.6 0 1.2.1 1.6.4l-.4 1c-.3-.2-.7-.3-1.2-.3-.5 0-.8.2-.8.5 0 .9 2.5.4 2.5 2.1 0 1.1-.9 1.7-2.3 1.7-.7 0-1.4-.2-1.8-.5l.5-1zm6.5-1.3c0-1.5 1-2.6 2.5-2.6.7 0 1.3.3 1.7.7l-.8.9c-.3-.3-.6-.5-1-.5-.8 0-1.3.6-1.3 1.5s.5 1.5 1.3 1.5c.4 0 .7-.2 1-.5l.8.9c-.4.5-1 .7-1.7.7-1.5 0-2.5-1.1-2.5-2.6z"
                fill="#FFFFFF"
            />
            {/* Orange Sun Accent */}
            <circle cx="38" cy="16" r="4" fill="#FF6600" />
        </svg>
    );
}

export default function PaymentLogos({
    className = "",
    title = "Accepted Payment Methods",
    showTitle = true,
    compact = false
}: {
    className?: string;
    title?: string;
    showTitle?: boolean;
    compact?: boolean;
}) {
    return (
        <div className={`flex flex-col sm:flex-row items-center gap-3 ${className}`}>
            {showTitle && (
                <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 shrink-0">
                    {title}:
                </span>
            )}
            <div className={`flex items-center flex-wrap justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
                <div title="Visa" className="hover:scale-105 transition-transform duration-150">
                    <VisaLogo className={compact ? "h-6 w-auto" : "h-7 w-auto"} />
                </div>
                <div title="Mastercard" className="hover:scale-105 transition-transform duration-150">
                    <MastercardLogo className={compact ? "h-6 w-auto" : "h-7 w-auto"} />
                </div>
                <div title="American Express" className="hover:scale-105 transition-transform duration-150">
                    <AmexLogo className={compact ? "h-6 w-auto" : "h-7 w-auto"} />
                </div>
                <div title="Apple Pay" className="hover:scale-105 transition-transform duration-150">
                    <ApplePayLogo className={compact ? "h-6 w-auto" : "h-7 w-auto"} />
                </div>
                <div title="Google Pay" className="hover:scale-105 transition-transform duration-150">
                    <GooglePayLogo className={compact ? "h-6 w-auto" : "h-7 w-auto"} />
                </div>
                <div title="Discover" className="hover:scale-105 transition-transform duration-150">
                    <DiscoverLogo className={compact ? "h-6 w-auto" : "h-7 w-auto"} />
                </div>
            </div>
        </div>
    );
}
