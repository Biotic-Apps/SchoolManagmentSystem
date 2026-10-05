import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loginUrl } from "./login-redirect";
import { useSession } from "./session-context";

/** Sends anonymous visitors of portal pages to /login (keeping where they were). */
export function useRequireSession() {
  const { status, reason } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") router.replace(loginUrl(pathname, reason));
  }, [status, reason, router, pathname]);

  return status;
}

export function useRedirectIfSignedIn(target: string) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" || status === "password-change") router.replace(target);
  }, [status, router, target]);
}
