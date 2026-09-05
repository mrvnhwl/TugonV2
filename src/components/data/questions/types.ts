export interface GivenQuestion {
  question_id: number;
  question_text: string;
  guide_text: string;
  category_text?: string;
  image_url?: string;
  image_alt?: string;
  question_type?: "step-by-step" | "fill-in-blanks" | "multiple-choice" | "true-false";
}
export interface Question {
  category_id: number;
  title?: string;
  category_question: string;
  given_question: GivenQuestion[];
  category_text?: string;
}
export interface Topic {
  id: number;
  name: string;
  description: string;
  level: Question[];
  isLocked?: boolean;
  prerequisiteIds?: number[];
  estimatedDuration?: number;
}
