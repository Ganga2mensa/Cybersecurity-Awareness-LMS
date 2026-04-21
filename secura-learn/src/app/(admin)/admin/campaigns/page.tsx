import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CampaignStatus } from "@prisma/client"

const STATUS_VARIANTS: Record<CampaignStatus, "default" | "outline" | "success" | "warning" | "destructive" | "secondary"> = {
  DRAFT: "outline",
  SCHEDULED: "warning",
  RUNNING: "default",
  COMPLETED: "success",
  PAUSED: "secondary",
}

export default async function AdminCampaignsPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const campaigns = await prisma.phishingCampaign.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { attempts: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Phishing Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your organization&apos;s phishing simulation campaigns
          </p>
        </div>
        <Link href="/admin/campaigns/new" className={cn(buttonVariants())}>
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No campaigns yet.</p>
            <Link href="/admin/campaigns/new" className={cn(buttonVariants(), "mt-4")}>
              Create your first campaign
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/admin/campaigns/${campaign.id}`}>
              <Card className="hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base">{campaign.title}</CardTitle>
                    <Badge variant={STATUS_VARIANTS[campaign.status]}>
                      {campaign.status}
                    </Badge>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{campaign._count.attempts} recipient{campaign._count.attempts !== 1 ? "s" : ""}</span>
                    <span>Created {campaign.createdAt.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
