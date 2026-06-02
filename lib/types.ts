// Types applicatifs alignés sur le schéma Supabase (voir supabase/migrations).

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type WordStatus = "new" | "learning" | "mastered";
export type QuizType =
  | "def_to_word"
  | "word_to_def"
  | "multiple_choice"
  | "fill_in_blank";

export type Profile = {
  id: string;
  email: string;
  created_at: string;
}

export type UserInterest = {
  id: string;
  user_id: string;
  interest: string;
  created_at: string;
}

export type Vocabulary = {
  id: string;
  user_id: string;
  word: string;
  english_definition: string | null;
  french_translation: string | null;
  french_definition: string | null;
  pronunciation: string | null;
  example_sentence: string | null;
  synonyms: string[];
  cefr_level: CefrLevel | null;
  mastery_score: number;
  review_count: number;
  interval_index: number;
  status: WordStatus;
  next_review_date: string;
  created_at: string;
}

export type QuizAttempt = {
  id: string;
  user_id: string;
  vocabulary_id: string;
  quiz_type: QuizType;
  is_correct: boolean;
  created_at: string;
}

export type StoryHistory = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  words_used: string[];
  interests_used: string[];
  created_at: string;
}

// Type pour le générique du client Supabase. La forme (Row/Insert/Update/
// Relationships) doit respecter `GenericSchema` de supabase-js, sinon les
// inserts sont inférés en `never`.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Pick<Profile, "id" | "email"> & Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      user_interests: {
        Row: UserInterest;
        Insert: Pick<UserInterest, "user_id" | "interest"> &
          Partial<UserInterest>;
        Update: Partial<UserInterest>;
        Relationships: [];
      };
      vocabulary: {
        Row: Vocabulary;
        Insert: Pick<Vocabulary, "user_id" | "word"> & Partial<Vocabulary>;
        Update: Partial<Vocabulary>;
        Relationships: [];
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Pick<
          QuizAttempt,
          "user_id" | "vocabulary_id" | "quiz_type" | "is_correct"
        > &
          Partial<QuizAttempt>;
        Update: Partial<QuizAttempt>;
        Relationships: [];
      };
      story_history: {
        Row: StoryHistory;
        Insert: Pick<StoryHistory, "user_id" | "title" | "content"> &
          Partial<StoryHistory>;
        Update: Partial<StoryHistory>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      cefr_level: CefrLevel;
      word_status: WordStatus;
      quiz_type: QuizType;
    };
    CompositeTypes: Record<string, never>;
  };
}
