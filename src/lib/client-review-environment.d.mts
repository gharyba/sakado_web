export type Environment = Record<string, string | undefined>;
export type HeaderBag = Pick<Headers, "get">;
export const reviewCookie: string;
export const reviewHeaders: Record<string, string>;
export function reviewOrigin(value: string | undefined): string | null;
export function clientReviewEnabled(env?: Environment, now?: number): boolean;
export function reviewRequestAllowed(
  headers: HeaderBag,
  env?: Environment,
): boolean;
export function reviewPathAllowed(path: string, method?: string): boolean;
