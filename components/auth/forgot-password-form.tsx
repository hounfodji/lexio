"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  requestPasswordReset,
  type AuthState,
} from "@/app/(auth)/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {},
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mot de passe oublié</CardTitle>
        <CardDescription>
          Entre ton email : on t&apos;envoie un lien pour en définir un nouveau.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="toi@exemple.com"
              required
            />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state.message && (
            <p role="status" className="text-sm text-success">
              {state.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-6 flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Envoi…" : "Envoyer le lien"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-foreground underline">
              Retour à la connexion
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
