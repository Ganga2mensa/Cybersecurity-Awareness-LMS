import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ManagerProfilePage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })
  if (!user) redirect("/sign-in")

  const displayName =
    user.firstName || user.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
      : user.email

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{displayName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <Badge variant="secondary">MANAGER</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
