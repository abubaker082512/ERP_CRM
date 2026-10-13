"use client";

import React, { useEffect, useRef } from "react";
import { encodeCode128B, generateQRCodeMatrix } from "@/lib/barcodeUtils";

interface BarcodeAndQRCanvasProps {
  value: string;
  type: "qr" | "code128" | "ean13";
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export default function BarcodeAndQRCanvas({
  value,
  type,
  title = "BERAXIS ENTERPRISE ASSET",
  subtitle = "Standard 80mm x 50mm Thermal Sticker",
  width = 300,
  height = 160,
  showText = true,
}: BarcodeAndQRCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high DPI resolution
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 2 : 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    const cleanVal = value.trim() || "BERAXIS-2026";

    if (type === "qr") {
      // Draw QR Code
      const matrix = generateQRCodeMatrix(cleanVal);
      const matrixSize = matrix.length;
      const qrPixelSize = Math.floor((height - 30) / matrixSize);
      const qrTotalWidth = qrPixelSize * matrixSize;
      const offsetX = Math.floor((width - qrTotalWidth) / 2);
      const offsetY = 12;

      ctx.fillStyle = "#000000";
      for (let r = 0; r < matrixSize; r++) {
        for (let c = 0; c < matrixSize; c++) {
          if (matrix[r][c]) {
            ctx.fillRect(offsetX + c * qrPixelSize, offsetY + r * qrPixelSize, qrPixelSize, qrPixelSize);
          }
        }
      }

      if (showText) {
        ctx.fillStyle = "#333333";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        const textToDisplay = cleanVal.length > 32 ? cleanVal.slice(0, 30) + "..." : cleanVal;
        ctx.fillText(textToDisplay, width / 2, height - 6);
      }
    } else {
      // Draw Code 128 / Barcode
      const { modules, formattedText } = encodeCode128B(cleanVal);
      if (modules.length > 0) {
        const barWidth = width / modules.length;
        const barHeight = height - (showText ? 42 : 20);
        const startY = 12;

        ctx.fillStyle = "#000000";
        for (let i = 0; i < modules.length; i++) {
          if (modules[i] === 1) {
            ctx.fillRect(i * barWidth, startY, Math.ceil(barWidth), barHeight);
          }
        }

        if (showText) {
          ctx.fillStyle = "#111827";
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.fillText(formattedText, width / 2, height - 10);
        }
      }
    }
  }, [value, type, width, height, showText]);

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-gray-300 shadow-sm text-black">
      {title && (
        <div className="text-[11px] font-extrabold tracking-wider text-gray-800 uppercase mb-2">
          {title}
        </div>
      )}
      <canvas ref={canvasRef} className="rounded" />
      {subtitle && (
        <div className="text-[9px] text-gray-500 mt-2 font-medium">
          {subtitle}
        </div>
      )}
    </div>
  );
}
