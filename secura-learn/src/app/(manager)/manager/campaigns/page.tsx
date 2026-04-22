import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculateAttemptRate } from "@/lib/campaigns"
import { CampaignStatus } from "@prisma/client"

const STATUS_VARIANTS: Record<
  CampaignStatus,
  "default" | "outline" | "success" | "warning" | "destructive" | "secondary"
> = {
  DRAFT: "outline",
  SCHEDULED: "warning",
  RUNNING: "default",
  COMPLETED: "success",
  PAUSED: "secondary",
}

export default async function ManagerCampaignsPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const campaigns = await prisma.phishingCampaign.findMany({
    where: { organizationId: user.organizationId },
    include: {
      attempts: {
        select: { opened: true, clicked: true, reported: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Phishing Campaigns</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Read-only view of all phishing simulation campaigns
        </p>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">No campaigns yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const total = campaign.attempts.length
            const opened = campaign.attempts.filter((a) => a.opened).length
            const clicked = campaign.attempts.filter((a) => a.clicked).length
            const reported = campaign.attempts.filter((a) => a.reported).length

            return (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{campaign.title}</CardTitle>
                      <Badge variant={STATUS_VARIANTS[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Recipients</p>
                      <p className="font-bold text-foreground text-lg">{total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Opened</p>
                      <p className="font-bold text-foreground text-lg">
                        {opened}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({calculateAttemptRate(opened, total)}%)
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clicked</p>
                      <p className="font-bold text-foreground text-lg">
                        {clicked}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({calculateAttemptRate(clicked, total)}%)
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reported</p>
                      <p className="font-bold text-foreground text-lg">
                        {reported}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({calculateAttemptRate(reported, total)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
