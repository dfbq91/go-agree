import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const startTime = Date.now();

  console.log("🩺 [HEALTH CHECK] Received request:", {
    timestamp: new Date().toISOString(),
    method: request.method,
    userAgent: request.headers.get("user-agent") || "unknown",
  });

  const healthData = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    responseTimeMs: Date.now() - startTime,
  };

  return NextResponse.json(healthData, { status: 200 });
}
