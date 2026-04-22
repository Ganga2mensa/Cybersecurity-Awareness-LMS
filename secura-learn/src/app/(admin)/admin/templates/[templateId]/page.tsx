import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TemplateForm } from "@/components/templates/TemplateForm"
import { deleteTemplate } from "@/actions/templates"
import { DeleteButton } from "@/components/shared/DeleteButton"

interface Props {
  params: Promise<{ templateId: string }>
}

export default async function TemplateDetailPage({ params }: Props) {
  const { templateId } = await params
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const template = await prisma.phishingTemplate.findUnique({
    where: { id: templateId },
  })

  if (!template || template.organizationId !== user.organizationId) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/templates" className="text-muted-foreground hover:text-foreground text-sm">
            ← Templates
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
        </div>
        <form
          action={async () => {
            "use server"
            await deleteTemplate(templateId)
            redirect("/admin/templates")
          }}
        >
          <DeleteButton confirmMessage="Delete this template? This cannot be undone." />        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Template</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateForm
            templateId={templateId}
            initialValues={{
              name: template.name,
              subject: template.subject,
              htmlBody: template.htmlBody,
              senderName: template.senderName,
              senderEmail: template.senderEmail,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden" style={{ height: "400px" }}>
            <iframe
              srcDoc={template.htmlBody}
              sandbox="allow-same-origin"
              className="w-full h-full"
              title="Template preview"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
