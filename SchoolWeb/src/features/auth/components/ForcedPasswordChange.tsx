"use client";

import { AppLogo } from "@/components/shared/AppLogo";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSession } from "../session-context";
import { useSignOut } from "../use-sign-out";
import { ChangePasswordForm } from "./ChangePasswordForm";

/** Shown instead of the portal while the account has mustChangePassword. */
export function ForcedPasswordChange() {
  const { completePasswordChange } = useSession();
  const signOut = useSignOut();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <AppLogo subtitle="School Management System" />
      <Card className="w-full max-w-[440px]">
        <CardHeader className="px-8 pt-8">
          <CardTitle>Set a new password</CardTitle>
          <CardDescription>Your account uses a temporary password. Choose your own to continue.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-8 pb-8 pt-6">
          <ChangePasswordForm onDone={completePasswordChange} submitLabel="Save and continue" />
          <Button variant="ghost" onClick={signOut} className="self-start">
            Sign out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
