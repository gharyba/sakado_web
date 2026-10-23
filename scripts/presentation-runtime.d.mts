export function securePresentationDirectory(directory: string): Promise<void>;
export function verifyPresentationDirectory(directory: string): Promise<void>;
export function writePresentationRuntime(
  directory: string,
  name: string,
  content: string,
): Promise<void>;
