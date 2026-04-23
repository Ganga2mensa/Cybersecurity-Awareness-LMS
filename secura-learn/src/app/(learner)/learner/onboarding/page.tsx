import { OnboardingForm } from "@/components/shared/OnboardingForm"

export default function LearnerOnboardingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome to SecuraLearn 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Let&apos;s set up your profile before you start
          </p>
        </div>

        <OnboardingForm />
      </div>
    </div>
  )
}
