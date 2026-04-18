import { auth, currentUser, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserGreeting } from "@/components/shared/UserGreeting"

export default async function LearnerDashboardPage() {
  const { userId, orgId } = await auth()

  // Redirect if no active organization
  if (!orgId) {
    redirect("/sign-in")
  }

  // Fetch user name and org name in parallel
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
    <div>
      <UserGreeting userName={userName} orgName={orgName} />
      <p className="text-muted-foreground">Phase 2 content coming soon</p>
    </div>
  )
}
