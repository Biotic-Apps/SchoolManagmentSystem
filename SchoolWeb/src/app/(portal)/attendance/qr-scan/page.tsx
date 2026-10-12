import type { Metadata } from "next";
import { ModuleGuard } from "@/features/modules/components/ModuleGuard";
import { QrScannerPage } from "@/features/attendance/components/QrScannerPage";

export const metadata: Metadata = { title: "QR Scan Attendance" };

export default function Page() {
  return (
    <ModuleGuard moduleId="attendance">
      <QrScannerPage />
    </ModuleGuard>
  );
}
