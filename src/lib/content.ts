/** Curated Support Library content, mirroring the Stitch "Find your center" screen. */

export type LibraryCategory =
  | "Guided Meditation"
  | "Mindful Exercises"
  | "Exam Strategy Tips";

export interface LibraryItem {
  id: string;
  category: LibraryCategory;
  tag: string;
  title: string;
  description: string;
  durationLabel: string;
  /** Meditation theme passed to the AI/offline meditation generator. */
  meditationTheme?: string;
  meditationMinutes?: number;
  icon?: string;
  featured?: boolean;
}

export const LIBRARY_CATEGORIES: { value: LibraryCategory; icon: string }[] = [
  { value: "Guided Meditation", icon: "self_care" },
  { value: "Mindful Exercises", icon: "fitness_center" },
  { value: "Exam Strategy Tips", icon: "lightbulb" },
];

export const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "breathing-exam-anxiety",
    category: "Guided Meditation",
    tag: "JEE Prep",
    title: "5-Minute Breathing for Exam Anxiety",
    description:
      "A quick, grounding exercise to reset your nervous system before a heavy study session or practice test.",
    durationLabel: "5 mins",
    meditationTheme: "Breathing for exam anxiety",
    meditationMinutes: 5,
    featured: true,
  },
  {
    id: "result-anxiety",
    category: "Guided Meditation",
    tag: "CAT Focus",
    title: "Overcoming Result Anxiety",
    description:
      "Loosen the grip of 'what if' thinking and return to the present moment.",
    durationLabel: "12 mins audio",
    meditationTheme: "Letting go of result anxiety",
    meditationMinutes: 12,
  },
  {
    id: "deep-sleep",
    category: "Guided Meditation",
    tag: "GATE Routine",
    title: "Deep Sleep Wind Down",
    description:
      "Quiet a racing mind and ease into restorative sleep after a long study day.",
    durationLabel: "20 mins audio",
    meditationTheme: "Deep sleep wind down",
    meditationMinutes: 20,
    icon: "bedtime",
  },
  {
    id: "333-grounding",
    category: "Mindful Exercises",
    tag: "Quick De-stress",
    title: "The 3-3-3 Grounding Technique",
    description:
      "When panic sets in, look around and name 3 things you see, 3 sounds you hear, and move 3 parts of your body. Let's walk through it together.",
    durationLabel: "2 mins",
    meditationTheme: "3-3-3 grounding for panic",
    meditationMinutes: 3,
    icon: "spa",
  },
  {
    id: "box-breathing",
    category: "Mindful Exercises",
    tag: "Focus Reset",
    title: "Box Breathing",
    description:
      "Inhale 4, hold 4, exhale 4, hold 4. A Navy-grade calm technique for before any test.",
    durationLabel: "5 mins",
    meditationTheme: "Box breathing focus reset",
    meditationMinutes: 5,
    icon: "crop_square",
  },
  {
    id: "morning-grounding",
    category: "Mindful Exercises",
    tag: "Daily Ritual",
    title: "Morning Grounding",
    description:
      "Begin the day rooted and calm before the books open, so stress doesn't set the tone.",
    durationLabel: "10 mins",
    meditationTheme: "Morning grounding ritual",
    meditationMinutes: 10,
    icon: "wb_twilight",
  },
  {
    id: "pomodoro-kindly",
    category: "Exam Strategy Tips",
    tag: "Study Rhythm",
    title: "Study in Kind Sprints",
    description:
      "Swap marathon cramming for 25-minute focused sprints with real breaks. Your brain consolidates more, and burns out less.",
    durationLabel: "3 min read",
    icon: "timer",
  },
  {
    id: "compare-less",
    category: "Exam Strategy Tips",
    tag: "Peer Pressure",
    title: "When Everyone Seems Ahead",
    description:
      "Other people's highlight reels aren't your syllabus. A practical reframe for the comparison trap that fuels self-doubt.",
    durationLabel: "4 min read",
    icon: "groups",
  },
  {
    id: "before-result-day",
    category: "Exam Strategy Tips",
    tag: "Result Season",
    title: "Surviving Result Day",
    description:
      "A grounding plan for the hours around a result — what to do before, during, and after, whatever the number says.",
    durationLabel: "5 min read",
    icon: "event",
  },
];

export function itemsByCategory(category: LibraryCategory): LibraryItem[] {
  return LIBRARY_ITEMS.filter((i) => i.category === category);
}
