export type PortfolioSection = "experience" | "projects";

export type PortfolioReturnState = {
  section: PortfolioSection;
  itemId: string;
  detailPath: string;
  sectionOffset: number;
  wheelRotation?: number;
  savedAt: number;
  restoreRequested: boolean;
};

export const PORTFOLIO_RETURN_STORAGE_KEY =
  "txy:portfolio-return-state:v1";
export const PORTFOLIO_RETURN_MAX_AGE_MS = 30 * 60 * 1000;

const isValidState = (value: unknown): value is PortfolioReturnState => {
  if (!value || typeof value !== "object") return false;

  const state = value as Partial<PortfolioReturnState>;
  return (
    (state.section === "experience" || state.section === "projects") &&
    typeof state.itemId === "string" &&
    typeof state.detailPath === "string" &&
    typeof state.sectionOffset === "number" &&
    typeof state.savedAt === "number" &&
    typeof state.restoreRequested === "boolean"
  );
};

export const readPortfolioReturnState = (
  section?: PortfolioSection,
): PortfolioReturnState | null => {
  if (typeof window === "undefined") return null;

  try {
    const value: unknown = JSON.parse(
      window.sessionStorage.getItem(PORTFOLIO_RETURN_STORAGE_KEY) ?? "null",
    );

    if (
      !isValidState(value) ||
      Date.now() - value.savedAt > PORTFOLIO_RETURN_MAX_AGE_MS
    ) {
      window.sessionStorage.removeItem(PORTFOLIO_RETURN_STORAGE_KEY);
      return null;
    }

    if (section && value.section !== section) return null;
    return value;
  } catch {
    window.sessionStorage.removeItem(PORTFOLIO_RETURN_STORAGE_KEY);
    return null;
  }
};

export const savePortfolioReturnState = (
  state: Omit<PortfolioReturnState, "savedAt" | "restoreRequested">,
) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      PORTFOLIO_RETURN_STORAGE_KEY,
      JSON.stringify({
        ...state,
        savedAt: Date.now(),
        restoreRequested: false,
      } satisfies PortfolioReturnState),
    );
  } catch {
    // Native navigation remains available when storage is unavailable.
  }
};

export const requestPortfolioRestore = (detailPath: string) => {
  const state = readPortfolioReturnState();
  if (!state || state.detailPath !== detailPath) return false;

  try {
    window.sessionStorage.setItem(
      PORTFOLIO_RETURN_STORAGE_KEY,
      JSON.stringify({ ...state, restoreRequested: true }),
    );
    return true;
  } catch {
    return false;
  }
};

export const clearPortfolioReturnState = () => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(PORTFOLIO_RETURN_STORAGE_KEY);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
};

export const getSectionOffset = (section: HTMLElement) => {
  const sectionTop = window.scrollY + section.getBoundingClientRect().top;
  return window.scrollY - sectionTop;
};
