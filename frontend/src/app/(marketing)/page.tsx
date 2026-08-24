import Hero from "@/components/landing/Hero";
import DeparturesBoard from "@/components/landing/DeparturesBoard";
import Pipeline from "@/components/landing/Pipeline";
import Platforms from "@/components/landing/Platforms";
import Pricing from "@/components/landing/Pricing";
import FinalCta from "@/components/landing/FinalCta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <DeparturesBoard />
      <Pipeline />
      <Platforms />
      <Pricing />
      <FinalCta />
    </>
  );
}
