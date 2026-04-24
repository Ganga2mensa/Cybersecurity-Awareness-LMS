import { Navbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { StatsSection } from "@/components/landing/StatsSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { RolesSection } from "@/components/landing/RolesSection"
import { CapabilitiesSection } from "@/components/landing/CapabilitiesSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { FreeToolsSection } from "@/components/landing/FreeToolsSection"
import { RecognitionSection } from "@/components/landing/RecognitionSection"
import { Footer } from "@/components/landing/Footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <RolesSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <FreeToolsSection />
      <RecognitionSection />
      <Footer />
    </>
  )
}
