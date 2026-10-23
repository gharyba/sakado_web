export function digest(bytes: Uint8Array | string): string;
export function safeRead(
  root: string,
  relative: string,
  maximum?: number,
): Promise<Buffer>;
export function preparePresentationCatalog(): Promise<{
  version: number;
  assets: unknown[];
}>;
