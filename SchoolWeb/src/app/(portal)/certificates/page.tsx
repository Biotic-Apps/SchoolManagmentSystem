import type { Metadata } from "next";
import { CertificatesRoute } from "@/features/certificates/components/CertificatesRoute";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";

export const metadata: Metadata = { title: "Certificates" };

export default function Page() {
  return (
    <ModuleGuard moduleId="certificates">
      <CertificatesRoute />
    </ModuleGuard>
  );
}
