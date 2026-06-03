import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

// Chiffrement symétrique des clés API utilisateur (AES-256-GCM).
// La clé de 32 octets est dérivée de AI_KEY_SECRET (n'importe quelle longueur).

const ALGO = "aes-256-gcm";

export function isEncryptionAvailable(): boolean {
  return Boolean(process.env.AI_KEY_SECRET);
}

function key(): Buffer {
  const secret = process.env.AI_KEY_SECRET;
  if (!secret) {
    throw new Error(
      "AI_KEY_SECRET manquante — impossible de chiffrer les clés API.",
    );
  }
  // SHA-256 → 32 octets quelle que soit la longueur du secret.
  return createHash("sha256").update(secret).digest();
}

/** Chiffre une chaîne. Retourne `iv:tag:cipher` en base64. */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64")).join(":");
}

/** Déchiffre une valeur produite par `encrypt`. */
export function decrypt(blob: string): string {
  const [ivB64, tagB64, dataB64] = blob.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Format de clé chiffrée invalide.");
  }
  const decipher = createDecipheriv(
    ALGO,
    key(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}
