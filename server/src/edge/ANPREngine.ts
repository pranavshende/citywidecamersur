/**
 * Simulated ANPR (Automatic Number Plate Recognition) Engine
 * In a real scenario, this runs models like LPRNet or PaddleOCR on cropped vehicle bounding boxes.
 */
export class ANPREngine {
  model: string;
  isReady: boolean;

  constructor(model = 'paddleocr-v3') {
    this.model = model;
    this.isReady = true;
  }

  /**
   * Simulates running OCR on a detected vehicle crop.
   * Introduces a realistic inference delay.
   */
  async processCrop(cropData: any): Promise<any> {
    if (!cropData) return null;

    // Simulate OCR inference time (30-100ms)
    const inferenceTime = 30 + Math.floor(Math.random() * 70);
    await new Promise(resolve => setTimeout(resolve, inferenceTime));

    // Like DetectionEngine, the actual text is injected by EdgeNode for the demo scenario.
    return {
      success: true,
      inferenceTimeMs: inferenceTime
    };
  }
}
