import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function TemplatesPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const templates = await prisma.phishingTemplate.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Phishing Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage email templates for phishing simulations
          </p>
        </div>
        <Link
          href="/admin/templates/new"
          className={cn(buttonVariants(), "bg-orange-500 text-white hover:bg-orange-400")}
        >
          + New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No templates yet.{" "}
              <Link href="/admin/templates/new" className="text-orange-500 hover:text-orange-400">
                Create your first template
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Templates ({templates.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sender</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Created</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr
                      key={template.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{template.name}</td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">
                        {template.subject}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {template.senderName} &lt;{template.senderEmail}&gt;
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/templates/${template.id}`}
                          className="text-orange-500 hover:text-orange-400 text-sm"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
