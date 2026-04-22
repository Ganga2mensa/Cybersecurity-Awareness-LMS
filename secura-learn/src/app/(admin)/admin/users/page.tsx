import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RoleChangeForm } from "@/components/users/RoleChangeForm"

export default async function AdminUsersPage() {
  const { userId: clerkUserId, orgId } = await auth()

  if (!clerkUserId || !orgId) {
    redirect("/sign-in")
  }

  // Get current user's DB id for self-detection
  const currentDbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, organizationId: true },
  })

  if (!currentDbUser) {
    redirect("/sign-in")
  }

  const users = await prisma.user.findMany({
    where: { organizationId: currentDbUser.organizationId },
    include: {
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const roleBadgeVariant = (role: string) => {
    if (role === "ADMIN") return "destructive"
    if (role === "MANAGER") return "secondary"
    return "outline"
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage all users in your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            All Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name / Email</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Enrollments</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const displayName =
                    user.firstName || user.lastName
                      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
                      : user.email
                  const isSelf = user.id === currentDbUser.id

                  return (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-medium text-foreground hover:text-orange-500 transition-colors"
                        >
                          {displayName}
                        </Link>
                        {displayName !== user.email && (
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        )}
                        {isSelf && (
                          <span className="text-xs text-orange-500 font-medium">(you)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={roleBadgeVariant(user.role) as "destructive" | "secondary" | "outline"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user._count.enrollments}
                      </td>
                      <td className="px-4 py-3">
                        <RoleChangeForm
                          userId={user.id}
                          currentRole={user.role}
                          isSelf={isSelf}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
