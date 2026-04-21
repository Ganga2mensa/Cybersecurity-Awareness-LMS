import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CampaignStatusButton } from "@/components/campaigns/CampaignStatusButton"
import { calculateAttemptRate } from "@/lib/campaigns"
import { CampaignStatus } from "@prisma/client"

const STATUS_VARIANTS: Record<CampaignStatus, "default" | "outline" | "success" | "warning" | "destructive" | "secondary"> = {
  DRAFT: "outline",
  SCHEDULED: "warning",
  RUNNING: "default",
  COMPLETED: "success",
  PAUSED: "secondary",
}

interface CampaignDetailPageProps {
  params: Promise<{ campaignId: string }>
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { campaignId } = await params
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const campaign = await prisma.phishingCampaign.findUnique({
    where: { id: campaignId },
    include: {
      attempts: {
        select: { opened: true, clicked: true, reported: true },
      },
    },
  })

  if (!campaign || campaign.organizationId !== user.organizationId) {
    notFound()
  }

  const totalRecipients = campaign.attempts.length
  const openedCount = campaign.attempts.filter((a) => a.opened).length
  const clickedCount = campaign.attempts.filter((a) => a.clicked).length
  const reportedCount = campaign.attempts.filter((a) => a.reported).length

  const openedRate = calculateAttemptRate(openedCount, totalRecipients)
  const clickedRate = calculateAttemptRate(clickedCount, totalRecipients)
  const reportedRate = calculateAttemptRate(reportedCount, totalRecipients)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/campaigns" className="text-muted-foreground hover:text-foreground text-sm">
          ← Campaigns
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{campaign.title}</h1>
            <Badge variant={STATUS_VARIANTS[campaign.status]}>{campaign.status}</Badge>
          </div>
          {campaign.description && (
            <p className="text-muted-foreground">{campaign.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Created {campaign.createdAt.toLocaleDateString()}
          </p>
        </div>
        <CampaignStatusButton campaignId={campaignId} currentStatus={campaign.status} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalRecipients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Opened</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{openedCount}</p>
            <p className="text-sm text-muted-foreground">{openedRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Clicked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{clickedCount}</p>
            <p className="text-sm text-muted-foreground">{clickedRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Reported</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{reportedCount}</p>
            <p className="text-sm text-muted-foreground">{reportedRate}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
