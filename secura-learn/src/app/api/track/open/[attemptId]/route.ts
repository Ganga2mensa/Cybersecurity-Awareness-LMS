import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
): Promise<NextResponse> {
  const { attemptId } = await params

  try {
    await prisma.phishingAttempt.update({
      where: { id: attemptId },
      data: { opened: true },
    })
  } catch {
    // Silently ignore — attempt may not exist or already opened
  }

  return new NextResponse(TRACKING_PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
