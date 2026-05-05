export interface FileMetadata {
  lineCount: number;
  characterCount: number;
  encoding: EncodingType;
  fileType: string;
  relativePath: string;
  isBinary: boolean;
  byteOrderMark: boolean;
}

export type EncodingType = 'utf-8' | 'utf-16le' | 'utf-16be' | 'ascii' | 'latin-1';
