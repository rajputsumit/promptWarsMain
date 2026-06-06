/** Shared domain types + a minimal generated-style Supabase Database type. */

export type ExamType = "NEET" | "JEE" | "UPSC" | "CAT" | "GATE" | "Boards" | "Other";

export const EXAM_OPTIONS: { value: ExamType; label: string }[] = [
  { value: "NEET", label: "NEET" },
  { value: "JEE", label: "JEE" },
  { value: "UPSC", label: "UPSC" },
  { value: "CAT", label: "CAT" },
  { value: "GATE", label: "GATE" },
  { value: "Boards", label: "Board Exams" },
  { value: "Other", label: "Other" },
];

export type Mood =
  | "Anxious"
  | "Burnout"
  | "Self-doubt"
  | "Overwhelmed"
  | "Numb"
  | "Quiet"
  | "Hopeful"
  | "Calm";

export const MOOD_OPTIONS: Mood[] = [
  "Anxious",
  "Burnout",
  "Self-doubt",
  "Overwhelmed",
  "Numb",
  "Quiet",
  "Hopeful",
  "Calm",
];

export type PhysicalSymptom =
  | "Lack of sleep"
  | "Headaches"
  | "Muscle tension"
  | "Restlessness";

export const SYMPTOM_OPTIONS: { value: PhysicalSymptom; icon: string }[] = [
  { value: "Lack of sleep", icon: "bedtime_off" },
  { value: "Headaches", icon: "sick" },
  { value: "Muscle tension", icon: "body_system" },
  { value: "Restlessness", icon: "directions_run" },
];

export type Trigger =
  | "Mock tests"
  | "Result pressure"
  | "Peer comparison"
  | "Family expectations"
  | "Time management"
  | "Self-doubt";

export const TRIGGER_OPTIONS: {
  value: Trigger;
  icon: string;
  hint: string;
  wide?: boolean;
}[] = [
  { value: "Mock tests", icon: "assignment", hint: "Upcoming exams or continuous assessments." },
  { value: "Result pressure", icon: "trending_down", hint: "Expectations from self or family." },
  { value: "Family expectations", icon: "diversity_3", hint: "Pressure to meet what loved ones hope for." },
  { value: "Time management", icon: "schedule", hint: "Not enough hours, syllabus feels endless." },
  {
    value: "Peer comparison",
    icon: "groups",
    hint: "Feeling behind or inadequate compared to classmates.",
    wide: true,
  },
];

export interface Profile {
  id: string;
  full_name: string | null;
  age: number | null;
  exams: ExamType[];
  onboarded: boolean;
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  /** 1 (very low) – 5 (very good) energy/valence rating from the mood slider. */
  intensity: number;
  moods: Mood[];
  symptoms: PhysicalSymptom[];
  triggers: Trigger[];
  /** Hours of sleep the prior night, used for trigger-correlation insights. */
  sleep_hours: number | null;
  reflection: string | null;
  created_at: string;
}

export type NewMoodLog = Omit<MoodLog, "id" | "user_id" | "created_at">;

export interface WellnessBreakdown {
  focus: number;
  emotionalBalance: number;
  sleepQuality: number;
  resilience: number;
}

export interface WellnessSnapshot {
  score: number;
  label: string;
  summary: string;
  breakdown: WellnessBreakdown;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* ------------------------------------------------------------------ */
/* Minimal Supabase Database typing (hand-written; mirrors schema.sql) */
/* ------------------------------------------------------------------ */

type ProfileRow = {
  id: string;
  full_name: string | null;
  age: number | null;
  exams: ExamType[];
  onboarded: boolean;
  created_at: string;
};

type MoodLogRow = {
  id: string;
  user_id: string;
  intensity: number;
  moods: Mood[];
  symptoms: PhysicalSymptom[];
  triggers: Trigger[];
  sleep_hours: number | null;
  reflection: string | null;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
      };
      mood_logs: {
        Row: MoodLogRow;
        Insert: Omit<MoodLogRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<MoodLogRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
