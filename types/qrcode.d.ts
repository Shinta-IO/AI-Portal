declare module 'qrcode' {
  export function toDataURL(
    text: string,
    options?: {
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
      type?: 'image/png' | 'image/jpeg' | 'image/webp';
      quality?: number;
      margin?: number;
      color?: {
        dark?: string;
        light?: string;
      };
      width?: number;
      scale?: number;
    }
  ): Promise<string>;

  export function toBuffer(
    text: string,
    options?: any
  ): Promise<Buffer>;

  export function toString(
    text: string,
    options?: any
  ): Promise<string>;

  export function toFile(
    path: string,
    text: string,
    options?: any
  ): Promise<void>;

  export function toFileStream(
    stream: NodeJS.WritableStream,
    text: string,
    options?: any
  ): void;

  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    options?: any
  ): Promise<HTMLCanvasElement>;

  export function toDataURL(
    text: string,
    callback: (err: Error | null, url: string) => void
  ): void;

  export function toDataURL(
    text: string,
    options: any,
    callback: (err: Error | null, url: string) => void
  ): void;

  export default {
    toDataURL,
    toBuffer,
    toString,
    toFile,
    toFileStream,
    toCanvas
  };
} 