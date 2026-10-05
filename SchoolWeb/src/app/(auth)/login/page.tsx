import { Suspense } from "react";
import type { Metadata } from "next";
import { AppLogo } from "@/components/shared/AppLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <AppLogo subtitle="School Management System" />
      <Card className="w-full max-w-[420px]">
        <CardHeader className="px-8 pt-8">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use the account your school administrator created for you.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
      <p className="text-caption text-fg-muted">Forgot your password? Contact your school office.</p>
    </main>
  );
}
