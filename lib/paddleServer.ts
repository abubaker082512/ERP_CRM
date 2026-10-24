import { Environment, LogLevel, Paddle, type PaddleOptions } from "@paddle/paddle-node-sdk";

let paddleInstance: Paddle | null = null;

export function getPaddleInstance(): Paddle {
  if (paddleInstance) return paddleInstance;

  const apiKey = process.env.PADDLE_API_KEY || "";
  if (!apiKey) {
    console.warn("PADDLE_API_KEY environment variable is not configured.");
  }
  const isProd = process.env.NEXT_PUBLIC_PADDLE_ENV === "production" || !process.env.NEXT_PUBLIC_PADDLE_ENV;

  const options: PaddleOptions = {
    environment: isProd ? Environment.production : Environment.sandbox,
    logLevel: LogLevel.error,
  };

  paddleInstance = new Paddle(apiKey, options);
  return paddleInstance;
}
