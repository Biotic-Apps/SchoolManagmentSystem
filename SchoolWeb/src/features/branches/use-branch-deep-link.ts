import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useBranch } from "./api";
import type { Branch } from "./types";

/** Opens the branch drawer for `?open=<branchId>` once the branch loads, then drops the parameter. */
export function useBranchDeepLink(show: (branch: Branch) => void) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openId = params.get("open");
  const { data } = useBranch(openId);
  const handled = useRef<string | null>(null);

  useEffect(() => {
    if (!data || handled.current === data.id) return;
    handled.current = data.id;
    show(data);
    router.replace(pathname, { scroll: false });
  }, [data, show, router, pathname]);
}
