type BackButtonProps = {
  className: string;
  fallbackHref?: string;
};

export default function BackButton({
  className,
  fallbackHref = "/#experience",
}: BackButtonProps) {
  return (
    <a className={className} href={fallbackHref}>
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </a>
  );
}
