import type { ComponentPropsWithoutRef } from "react";

/** Shared responsive width and gutters for every portfolio section. */
export function Container({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`mx-auto w-full max-w-(--content-width) px-(--page-gutter) ${className}`}
      {...props}
    />
  );
}
