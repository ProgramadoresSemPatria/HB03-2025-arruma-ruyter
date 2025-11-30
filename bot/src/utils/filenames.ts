export const extractFilenames = (files: { filename: string }[]): string[] =>
  files.map((file) => file.filename);