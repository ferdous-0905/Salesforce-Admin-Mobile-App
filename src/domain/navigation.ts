/** Navigation changes visibility only; quiz and form state belong to their screen hosts. */
export type Page = "home" | "quiz" | "progress" | "settings" | "library";
export type MainTab = "practice" | "progress" | "settings" | "library";
export interface NavigationState {
  activeTab: MainTab;
  practicePage: "home" | "quiz";
}
export const initialNavigation: NavigationState = {
  activeTab: "practice",
  practicePage: "home",
};
export type NavigationAction =
  { type: "tab"; tab: MainTab } | { type: "page"; page: Page };
export function navigationReducer(
  state: NavigationState,
  action: NavigationAction,
): NavigationState {
  if (action.type === "tab") return { ...state, activeTab: action.tab };
  if (action.page === "home" || action.page === "quiz")
    return { activeTab: "practice", practicePage: action.page };
  return { ...state, activeTab: action.page };
}
export function visiblePage(state: NavigationState): Page {
  return state.activeTab === "practice" ? state.practicePage : state.activeTab;
}
