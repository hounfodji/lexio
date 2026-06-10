"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updatePassword,
  updateUsername,
  type AuthState,
} from "@/app/(auth)/actions";

export function ProfileForm({ initialUsername }: { initialUsername: string }) {
  const [nameState, nameAction, namePending] = useActionState<AuthState, FormData>(
    updateUsername,
    {},
  );
  const [pwdState, pwdAction, pwdPending] = useActionState<AuthState, FormData>(
    updatePassword,
    {},
  );

  return (
    <div className="space-y-6">
      {/* Nom d'affichage */}
      <form action={nameAction} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="username">Nom d&apos;utilisateur</Label>
          <Input
            id="username"
            name="username"
            type="text"
            defaultValue={initialUsername}
            maxLength={40}
            required
          />
          <p className="text-xs text-muted-foreground">
            Affiché sur le tableau de bord. La connexion reste par email.
          </p>
        </div>
        {nameState.error && (
          <p role="alert" className="text-sm text-destructive">
            {nameState.error}
          </p>
        )}
        {nameState.message && (
          <p role="status" className="text-sm text-success">
            {nameState.message}
          </p>
        )}
        <Button type="submit" variant="outline" disabled={namePending}>
          {namePending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>

      {/* Mot de passe */}
      <form action={pwdAction} className="space-y-3 border-t pt-6">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mot de passe actuel</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        {pwdState.error && (
          <p role="alert" className="text-sm text-destructive">
            {pwdState.error}
          </p>
        )}
        {pwdState.message && (
          <p role="status" className="text-sm text-success">
            {pwdState.message}
          </p>
        )}
        <Button type="submit" variant="outline" disabled={pwdPending}>
          {pwdPending ? "Mise à jour…" : "Mettre à jour le mot de passe"}
        </Button>
      </form>
    </div>
  );
}
