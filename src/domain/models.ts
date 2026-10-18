export type QuestionType = "single_choice" | "multiple_choice" | "true_false";
export type VerificationStatus =
  "unverified" | "verified" | "document_conflict" | "needs_review";
export type PracticeMode = "random" | "failed";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface OptionExplanation {
  optionIndex: number;
  optionId: string;
  assessment: "correct" | "incorrect" | "discussion";
  reason: string;
}

export interface QuestionExplanation {
  summary: string;
  correctOptions?: Record<string, string>;
  incorrectOptions?: Record<string, string>;
  optionExplanations?: OptionExplanation[];
}

export interface ResearchSource {
  title?: string;
  url?: string;
  publisher?: string;
  accessedAt?: string;
}

export interface LearningScreenshot {
  imagePath: string;
  originalImageUrl: string;
  width: number;
  height: number;
  sha256: string;
  alt: string;
  caption: string;
  navigationPath: string;
  keyPoints: string[];
}

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  kind: "reading" | "video" | "screenshot";
  publisher: string;
  description: string;
  relevance: string;
  reviewedAt: string;
  reviewNote: string;
  youtubeId?: string;
  startSeconds?: number;
  screenshot?: LearningScreenshot;
}

export interface Question {
  questionNumber: number;
  type: QuestionType;
  requiredAnswers: number;
  question: string;
  options: QuestionOption[];
  documentAnswer: string[];
  verifiedAnswer: string[] | null;
  documentExplanation: string;
  explanation: QuestionExplanation | null;
  sources: ResearchSource[];
  learningResources?: LearningResource[];
  verificationStatus: VerificationStatus;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Attempt {
  submittedAnswers: string[];
  submittedOptionIndices?: number[];
  correct: boolean | null;
  attemptedAt: string;
  answerVersion?: string;
}

export interface UserQuestionProgress {
  questionNumber: number;
  attempts: number;
  status: "passed" | "failed" | "reviewed";
  lastAnswer: string[];
  lastResult: "correct" | "incorrect" | "ungraded";
  lastAttemptAt: string;
  history: Attempt[];
}

export interface ProgressStatistics {
  reviewed?: number;
  attempted: number;
  passed: number;
  failed: number;
  totalAttempts: number;
  correctSubmissions: number;
  incorrectSubmissions: number;
  score: number;
}

export type Gender =
  "female" | "male" | "non_binary" | "another_gender" | "prefer_not_to_say";

export interface SignupDetails {
  gender: Gender;
  phone: string;
}

export interface ProfileDetails {
  name: string;
  dateOfBirth: string;
  email: string;
}

export type UserRole = "admin" | "lite" | "premium";

export interface ExplanationAccess {
  alreadyViewed: boolean;
  allowed: boolean;
  limit: number | null;
  remaining: number | null;
  day: string;
  timeZone: string;
}

export interface SessionView {
  actor: { key: string; name: string; role: UserRole; root: boolean };
  user: UserProgress;
  impersonating: boolean;
  explanationAccess: ExplanationAccess;
}

export interface ManagedUser {
  key: string;
  name: string;
  email?: string;
  role: UserRole;
  root: boolean;
  suspended: boolean;
  attempted: number;
  score: number;
}

export interface UserProgress {
  googleAccount?: { id: string; email: string; name: string };
  name: string;
  role?: UserRole;
  suspended?: boolean;
  adminAccessKeyHash?: string;
  premiumPurchase?: {
    requestId: string;
    amountBdt: number;
    provider: "bkash" | "nagad";
    approvedAt: string;
  };
  explanationUsage?: {
    day: string;
    questionNumbers: number[];
    version?: "manual-reveal";
  };
  // Optional so existing name-only profiles remain readable.
  dateOfBirth?: string;
  email?: string;
  // Optional so profiles created before the expanded signup form remain compatible.
  gender?: Gender;
  phone?: string;
  storageKey: string;
  createdAt: string;
  updatedAt: string;
  statistics: ProgressStatistics;
  questions: Record<string, UserQuestionProgress>;
}

/** Only these fields can be exposed before a question is submitted. */
export interface PublicQuestion {
  questionNumber: number;
  type: QuestionType;
  requiredAnswers: number;
  question: string;
  options: QuestionOption[];
  verificationStatus: VerificationStatus;
  reviewRequired: boolean;
}

export interface NextQuestion extends PublicQuestion {
  statistics: Pick<ProgressStatistics, "score">;
}

export interface AttemptFeedback {
  explanationRevealed: boolean;
  explanationAccess?: ExplanationAccess;
  correct: boolean | null;
  graded: boolean;
  userAnswer: string[];
  userOptionIndices?: number[];
  correctAnswer: string[];
  documentAnswer: string[];
  verifiedAnswer: string[] | null;
  statistics: ProgressStatistics;
  verificationStatus: VerificationStatus;
  documentExplanation: string;
  explanation: QuestionExplanation | null;
  sources: ResearchSource[];
  learningResources?: LearningResource[];
  reviewedAt?: string;
  reviewNotes?: string;
}

/** In-memory visit state; navigation must not turn it into another saved attempt. */
export interface QuizVisit {
  question: Question;
  selected: string[];
  submitted: boolean;
  correct: boolean | null;
}
