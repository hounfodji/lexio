// HD désactivable via NEXT_PUBLIC_HD_VOICE_ENABLED=false sur Vercel.
// Par défaut activé (dev local) — il faut explicitement mettre "false" pour couper.
export function isHdVoiceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HD_VOICE_ENABLED !== "false";
}
