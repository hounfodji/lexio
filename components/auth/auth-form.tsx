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
import type { AuthState } from "@/app/(auth)/actions";

type Action = (state: AuthState, formData: FormData) => Promise<AuthState>;

interface AuthFormProps {
  mode: "login" | "signup";
  action: Action;
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );
  const isLogin = mode === "login";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isLogin ? "Connexion" : "Créer un compte"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Reprends ton apprentissage là où tu t'es arrêté."
            : "Commence à transformer tes mots en histoires."}
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
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="••••••••"
              required
            />
            {isLogin && (
              <p className="text-right text-xs">
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground underline-offset-2 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </p>
            )}
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
            {pending
              ? "Patiente…"
              : isLogin
                ? "Se connecter"
                : "S'inscrire"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Pas encore de compte ?{" "}
                <Link href="/signup" className="text-foreground underline">
                  Inscris-toi
                </Link>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <Link href="/login" className="text-foreground underline">
                  Connecte-toi
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
