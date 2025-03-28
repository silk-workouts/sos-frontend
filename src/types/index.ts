// src/types/index.ts
export interface SavedProgram {
  userId: string;
  continuousVideoId: string;
  title: string;
  description: string;
  videoCount: number;
  duration: number;
  createdAt?: string;
}
