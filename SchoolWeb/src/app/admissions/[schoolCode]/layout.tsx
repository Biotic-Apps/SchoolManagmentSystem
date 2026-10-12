import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Online Admission",
  description: "Apply for admission online",
};

export default function AdmissionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      {children}
    </div>
  );
}
