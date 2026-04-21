import { auth, currentUser, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserGreeting } from "@/components/shared/UserGreeting"
import { syncUserToDatabase } from "@/actions/user"

export default async function AdminDashboardPage() {
  await syncUserToDatabase()

  const { orgId } = await auth()

  if (!orgId) {
    redirect("/sign-in")
  }

  const [user, client] = await Promise.all([
    currentUser(),
    clerkClient(),
  ])

  const userName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : (user?.emailAddresses?.[0]?.emailAddress ?? null)

  let orgName: string | null = null
  try {
    const org = await client.organizations.getOrganization({ organizationId: orgId })
    orgName = org.name
  } catch {
    orgName = null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <UserGreeting userName={userName} orgName={orgName} />

      {/* Placeholder card */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          Phase 2 content coming soon — courses, users, and campaign management will appear here.
        </p>
      </div>
    </div>
  )
}
