"use client";

import { requestPortfolioRestore } from "../../portfolioReturnState";

type BackButtonProps = {
  className: string;
  fallbackHref?: string;
};

export default function BackButton({
  className,
  fallbackHref = "/#experience",
}: BackButtonProps) {
  return (
    <a
      className={className}
      href={fallbackHref}
      onClick={() => requestPortfolioRestore(window.location.pathname)}
    >
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </a>
  );
}
