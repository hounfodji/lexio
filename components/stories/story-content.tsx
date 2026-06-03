import Link from "next/link";

// Rend le texte d'une histoire en surlignant les mots du vocabulaire de
// l'utilisateur, chaque surlignage renvoyant vers la fiche du mot (F8.4 / D2).
export function StoryContent({
  content,
  wordMap,
}: {
  content: string;
  wordMap: Record<string, string>; // mot (minuscule) -> id vocabulaire
}) {
  const words = Object.keys(wordMap);

  if (words.length === 0) {
    return <p className="whitespace-pre-line leading-relaxed">{content}</p>;
  }

  const escaped = words.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const re = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const parts = content.split(re);

  return (
    <p className="whitespace-pre-line leading-relaxed">
      {parts.map((part, i) => {
        const id = wordMap[part.toLowerCase()];
        if (id) {
          return (
            <Link
              key={i}
              href={`/vocabulary/${id}`}
              className="rounded bg-info-muted px-1 text-info underline-offset-2 hover:underline"
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
