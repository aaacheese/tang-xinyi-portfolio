"use client";

type BackButtonProps = {
  className: string;
};

export default function BackButton({ className }: BackButtonProps) {
  const handleBack = () => {
    const cameFromThisSite = (() => {
      if (!document.referrer) return false;

      try {
        return new URL(document.referrer).origin === window.location.origin;
      } catch {
        return false;
      }
    })();

    if (cameFromThisSite && window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/#experience");
  };

  return (
    <button className={className} type="button" onClick={handleBack}>
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button>
  );
}
