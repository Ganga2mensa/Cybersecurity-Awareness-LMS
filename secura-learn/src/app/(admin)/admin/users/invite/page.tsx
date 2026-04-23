import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { InviteUserForm } from "@/components/users/InviteUserForm"

export default function InviteUserPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Invite Team Member</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Send an email invitation to add someone to your organization.
        </p>
      </div>

      <InviteUserForm />
    </div>
  )
}
