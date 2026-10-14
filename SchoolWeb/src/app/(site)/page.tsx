import { Hero } from "@/components/site/sections/Hero";
import { StatTiles } from "@/components/site/sections/StatTiles";
import { HowItWorks } from "@/components/site/sections/HowItWorks";
import { FeatureShowcases } from "@/components/site/sections/FeatureScrollSections";
import { AttendanceFlow } from "@/components/site/sections/AttendanceFlow";
import { RolePortals } from "@/components/site/sections/RolePortals";
import { SchoolDay } from "@/components/site/sections/SchoolDay";
import { PrintDocs } from "@/components/site/sections/PrintDocs";
import { AndroidApp } from "@/components/site/sections/AndroidApp";
import { PaperVsESchool } from "@/components/site/sections/PaperVsESchool";
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
      <FeatureShowcases />
      <AttendanceFlow />
      <RolePortals />
      <SchoolDay />
      <PrintDocs />
      <AndroidApp />
      <PaperVsESchool />
      <Modules />
      <BuiltForPakistan />
      <Trust />
      <Faq />
      <CtaBand />
    </>
  );
}
