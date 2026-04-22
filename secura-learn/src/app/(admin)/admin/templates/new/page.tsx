import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplateForm } from "@/components/templates/TemplateForm"

export default function NewTemplatePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/templates" className="text-muted-foreground hover:text-foreground text-sm">
          ← Templates
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Template</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateForm />
        </CardContent>
      </Card>
    </div>
  )
}
