declare module "@vimeo/player" {
  export default class Player {
    constructor(element: HTMLElement | string, options?: any);
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback?: (data: any) => void): void;
    play(): Promise<void>;
    pause(): Promise<void>;
    unload(): Promise<void>;
    destroy(): Promise<void>;
    setCurrentTime(seconds: number): Promise<number>;
    getCurrentTime(): Promise<number>;
    getDuration(): Promise<number>;
    ready(): Promise<void>;
  }
}
