"use client";

import Script from "next/script";

export default function CreemScript() {
    return (
        <Script
            src="https://www.creem.io/embed.js"
            strategy="afterInteractive"
            async
        />
    );
}
