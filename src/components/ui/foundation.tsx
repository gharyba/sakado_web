import type { ComponentProps, HTMLAttributes } from "react";
import Link from "@/components/link";

function classes(...values: (string | undefined | false)[]) {
  return values.filter(Boolean).join(" ");
}

export function Container({
  reading = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { reading?: boolean }) {
  return (
    <div
      className={classes(
        "s-container",
        reading && "s-container--reading",
        className,
      )}
      {...props}
    />
  );
}

export function Section({
  tone = "default",
  compact = false,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & {
  tone?: "default" | "muted" | "dark";
  compact?: boolean;
}) {
  return (
    <section
      className={classes(
        "s-section",
        `s-section--${tone}`,
        compact && "s-section--compact",
        className,
      )}
      {...props}
    />
  );
}

type Variant = "primary" | "secondary" | "text";
function buttonClass(variant: Variant, className?: string) {
  return classes("s-button", `s-button--${variant}`, className);
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={buttonClass(variant, className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function MediaFrame({
  ratio = "landscape",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  ratio?: "landscape" | "portrait" | "wide" | "square";
}) {
  return (
    <div
      className={classes("s-media", `s-media--${ratio}`, className)}
      {...props}
    />
  );
}
