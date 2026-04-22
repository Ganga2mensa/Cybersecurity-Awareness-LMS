import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DEFAULT_REDIRECT = "/unauthorized"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
): Promise<NextResponse> {
  const { attemptId } = await params
  const redirectUrl = req.nextUrl.searchParams.get("redirect") ?? DEFAULT_REDIRECT

  try {
    await prisma.phishingAttempt.update({
      where: { id: attemptId },
      data: { clicked: true, clickedAt: new Date() },
    })
  } catch {
    // Silently ignore — attempt may not exist
  }

  // Validate redirect URL to prevent open redirect attacks
  let safeRedirect: string
  try {
    const parsed = new URL(redirectUrl, req.nextUrl.origin)
    // Only allow same-origin redirects
    if (parsed.origin === req.nextUrl.origin) {
      safeRedirect = parsed.pathname + parsed.search
    } else {
      safeRedirect = DEFAULT_REDIRECT
    }
  } catch {
    safeRedirect = DEFAULT_REDIRECT
  }

  return NextResponse.redirect(new URL(safeRedirect, req.nextUrl.origin), { status: 302 })
}
