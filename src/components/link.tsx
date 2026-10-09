import NextLink from "next/link";
import type { ComponentProps } from "react";
// Instagram visitors should not download every linked route before choosing an adventure.
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
