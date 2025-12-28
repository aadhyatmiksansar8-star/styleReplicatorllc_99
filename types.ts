
export enum AppStep {
  UPLOAD_REFERENCE = 'UPLOAD_REFERENCE',
  ANALYZING = 'ANALYZING',
  PROMPT_READY = 'PROMPT_READY',
  UPLOAD_SOURCE = 'UPLOAD_SOURCE',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT'
}

export interface AnalysisResult {
  outfit: string;
  accessories: string;
  pose: string;
  cameraAngle: string;
  lighting: string;
  aesthetic: string;
  cohesivePrompt: string;
}

export interface ImageData {
  base64: string;
  mimeType: string;
}
