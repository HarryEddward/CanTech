import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

  const res = NextResponse.json({
    status: "Chekout session created",
    timestamp: new Date().toISOString()
  });

  return res;
}