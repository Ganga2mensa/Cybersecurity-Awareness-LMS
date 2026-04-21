import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CampaignForm } from "@/components/campaigns/CampaignForm"

export default function NewCampaignPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Create New Campaign</h1>
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignForm />
        </CardContent>
      </Card>
    </div>
  )
}
