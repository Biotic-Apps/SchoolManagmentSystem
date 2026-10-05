import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";

export function PasswordCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Changing your password signs you out on your other devices.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChangePasswordForm />
      </CardContent>
    </Card>
  );
}
