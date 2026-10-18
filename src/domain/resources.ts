import type { LearningResource, Question } from "./models";
import videos from "../../assets/data/videos.json";
import screenshots from "../../assets/data/screenshots.json";
export function resourcesFor(question: Question): LearningResource[] {
  const id = String(question.questionNumber);
  const videoMapping = (
    videos.questionResources as Record<
      string,
      { resourceIds: string[]; relevance: Record<string, string> }
    >
  )[id];
  const imageMapping = (
    screenshots.questionScreenshots as Record<
      string,
      { resourceIds: string[]; relevance: string }
    >
  )[id];
  const readings: LearningResource[] = [
    ...new Map(
      question.sources
        .filter((s) => s.url?.startsWith("https://"))
        .map((s) => [s.url, s]),
    ).values(),
  ].map((source, i) => ({
    id: `source-${i}`,
    kind: "reading",
    title: source.title || source.publisher || "Salesforce documentation",
    url: source.url!,
    publisher: source.publisher || "Salesforce",
    description:
      question.explanation?.summary ||
      question.reviewNotes ||
      "Compare this documentation with the scenario.",
    relevance: `Question #${id}: compare the source with the option reasoning.`,
    reviewedAt: source.accessedAt || question.reviewedAt || "",
    reviewNote:
      "Question-specific research reference. The explanation applies documentation to the scenario; it is not an official exam answer.",
  }));
  const images: LearningResource[] = screenshots.resources
    .filter((r) => imageMapping?.resourceIds.includes(r.id))
    .map((r) => ({
      ...r,
      kind: "screenshot",
      relevance: imageMapping.relevance,
    }));
  const clips: LearningResource[] = videos.resources
    .filter((r) => videoMapping?.resourceIds.includes(r.id))
    .map((r) => ({
      ...r,
      kind: "video",
      relevance: videoMapping.relevance[r.id],
    }));
  return [...readings, ...images, ...clips];
}
export function videoEmbedUrl(resource: LearningResource): string | null {
  if (
    resource.kind !== "video" ||
    !resource.youtubeId ||
    !/^[A-Za-z0-9_-]{11}$/.test(resource.youtubeId) ||
    resource.url !== `https://www.youtube.com/watch?v=${resource.youtubeId}` ||
    !Number.isInteger(resource.startSeconds ?? 0) ||
    (resource.startSeconds ?? 0) < 0
  )
    return null;
  return `https://www.youtube.com/embed/${resource.youtubeId}?playsinline=1&autoplay=0&rel=0&start=${resource.startSeconds ?? 0}`;
}

export type MediaFilter = "all" | "screenshots" | "videos";
export interface QuestionMedia {
  question: Question;
  screenshotCount: number;
  videoCount: number;
}
export function mediaAvailability(question: Question): QuestionMedia {
  const resources = resourcesFor(question);
  return {
    question,
    screenshotCount: resources.filter((r) => r.kind === "screenshot").length,
    videoCount: resources.filter((r) => r.kind === "video").length,
  };
}
export function mediaQuestions(
  bank: readonly Question[],
  filter: MediaFilter = "all",
  search = "",
): QuestionMedia[] {
  const query = search.trim().toLowerCase().replace(/^#/, "");
  return bank
    .map(mediaAvailability)
    .filter(
      (row) =>
        (row.screenshotCount > 0 || row.videoCount > 0) &&
        (filter !== "screenshots" || row.screenshotCount > 0) &&
        (filter !== "videos" || row.videoCount > 0) &&
        (!query ||
          (/^\d+$/.test(query)
            ? String(row.question.questionNumber) === query
            : row.question.question.toLowerCase().includes(query))),
    );
}
