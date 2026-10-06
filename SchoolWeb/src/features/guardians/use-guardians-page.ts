import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import type { Guardian } from "./types";

export type GuardiansTabId = "guardians" | "requests";

/** Branch context, tabs and the open guardian drawer (also opened by `?open=<guardianId>`). */
export function useGuardiansPage() {
  const picker = useBranchPicker();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [tab, setTab] = useState<GuardiansTabId>("guardians");
  const [openId, setOpenId] = useState<string | null>(() => params.get("open"));

  const closeDrawer = () => {
    setOpenId(null);
    if (params.get("open")) router.replace(pathname, { scroll: false });
  };

  return {
    picker,
    branchId: picker.branchId,
    tab,
    setTab: (value: string) => setTab(value as GuardiansTabId),
    openId,
    openGuardian: (guardian: Guardian) => setOpenId(guardian.id),
    closeDrawer,
  };
}
