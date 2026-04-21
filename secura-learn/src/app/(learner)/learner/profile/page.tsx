import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditNameForm } from "@/components/shared/EditNameForm"

export default async function LearnerProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { organization: true },
  })

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-12 rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Profile not found. Please try again.
        </p>
      </div>
    )
  }

  const roleBadgeClass =
    user.role === "ADMIN"
      ? "inline-flex items-center rounded-full bg-orange-100 px-3 py-0.5 text-sm font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      : "inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Profile</h1>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Full Name
            </p>
            <p className="text-base font-medium text-foreground">
              {user.firstName || user.lastName 
                ? [user.firstName, user.lastName].filter(Boolean).join(' ')
                : <span className="text-muted-foreground italic">Not set</span>}
            </p>
          </div>

          {/* Email */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Email Address
            </p>
            <p className="text-base text-foreground">{user.email}</p>
          </div>

          {/* Organization */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Organization
            </p>
            <p className="text-base text-foreground">{user.organization.name}</p>
          </div>

          {/* Role */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Role
            </p>
            <span className={roleBadgeClass}>{user.role}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-border" />

        {/* Edit Name Form */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Update Display Name</h2>
          <EditNameForm currentFirstName={user.firstName} currentLastName={user.lastName} />
        </div>
      </div>
    </div>
  )
}
