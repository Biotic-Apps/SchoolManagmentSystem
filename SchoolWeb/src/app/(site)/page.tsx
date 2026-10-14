import { Hero } from "@/components/site/sections/Hero";
import { StatTiles } from "@/components/site/sections/StatTiles";
import { HowItWorks } from "@/components/site/sections/HowItWorks";
import {
  AcademicsShowcase,
  AttendanceShowcase,
  FeesShowcase,
  ParentShowcase,
} from "@/components/site/sections/FeatureScrollSections";
import { AttendanceFlow } from "@/components/site/sections/AttendanceFlow";
import { Modules } from "@/components/site/sections/Modules";
import { BuiltForPakistan } from "@/components/site/sections/BuiltForPakistan";
import { Trust } from "@/components/site/sections/Trust";
import { Faq } from "@/components/site/sections/Faq";
import { CtaBand } from "@/components/site/sections/CtaBand";
import { JsonLd, faqSchema, organisationSchema, softwareSchema } from "@/lib/site/schema";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organisationSchema()} />
      <JsonLd data={softwareSchema()} />
      <JsonLd data={faqSchema()} />
      <Hero />
      <StatTiles />
      <HowItWorks />
      <AttendanceShowcase />
      <AttendanceFlow />
      <AcademicsShowcase />
      <FeesShowcase />
      <ParentShowcase />
      <Modules />
      <BuiltForPakistan />
      <Trust />
      <Faq />
      <CtaBand />
    </>
  );
}
