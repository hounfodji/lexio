"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
}

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  redirect("/dashboard");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit faire au moins 6 caractères." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: "Cet email est déjà utilisé." };
    }
    return { error: error.message };
  }

  // Si la confirmation par email est activée, aucune session n'est créée.
  if (!data.session) {
    return {
      message:
        "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.",
    };
  }

  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// --- Profil : nom d'utilisateur -----------------------------------------

export async function updateUsername(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  if (!username) return { error: "Le nom est requis." };
  if (username.length > 40)
    return { error: "Le nom doit faire 40 caractères maximum." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée." };

  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id);

  if (error) return { error: "Impossible de mettre à jour le nom." };

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { message: "Nom mis à jour." };
}

// --- Mot de passe : changement avec vérification de l'ancien ------------

export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Tous les champs sont requis." };
  }
  if (newPassword.length < 6) {
    return { error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }
  if (newPassword === currentPassword) {
    return { error: "Le nouveau mot de passe doit être différent de l'ancien." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Session expirée." };

  // Vérifie l'ancien mot de passe via une tentative de connexion. Si la
  // session est restaurée par signInWithPassword, c'est OK — sinon on rejette.
  const { error: checkError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (checkError) return { error: "Ancien mot de passe incorrect." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Impossible de mettre à jour le mot de passe." };

  return { message: "Mot de passe mis à jour." };
}

// --- Mot de passe oublié : envoi du mail --------------------------------

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email requis." };

  const h = await headers();
  const origin =
    h.get("origin") ??
    (h.get("host") ? `https://${h.get("host")}` : null) ??
    "http://localhost:3000";

  const supabase = await createClient();
  // On n'expose pas si l'email existe ou non : message générique dans tous les cas.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  return {
    message:
      "Si un compte existe pour cet email, un message vient d'être envoyé. Vérifie ta boîte mail.",
  };
}

// --- Mot de passe oublié : nouveau mot de passe après clic sur le lien --

export async function updatePasswordAfterReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!newPassword || !confirmPassword) {
    return { error: "Les deux champs sont requis." };
  }
  if (newPassword.length < 6) {
    return { error: "Le mot de passe doit faire au moins 6 caractères." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Lien expiré ou invalide. Redemande un email de réinitialisation.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Impossible de mettre à jour le mot de passe." };

  redirect("/dashboard");
}
