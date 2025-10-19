import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { SceneJSON } from '../types';
import { GOOGLE_API_KEY, GEMINI_MODEL, SCENE_ANALYSIS_PROMPT } from '../constants';

const SceneSchema = z.object({
  crosswalk_present: z.boolean(),
  alignment: z.enum(['center', 'veer_left', 'veer_right', 'unknown']),
  curb_ahead: z.boolean(),
  obstacle_close: z.boolean(),
  pedestrian_signal: z.enum(['walk', 'dont_walk', 'countdown', 'none']),
  confidence: z.number().min(0).max(1),
  narration: z.string().optional(),
});

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI && GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
  }
  if (!genAI) {
    throw new Error('Google API key not configured');
  }
  return genAI;
}

export async function analyzeFrameAsync(base64Jpeg: string): Promise<SceneJSON> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });

    const result = await model.generateContent([
      SCENE_ANALYSIS_PROMPT,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Jpeg,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    console.log('🔍 [GEMINI] Raw AI response:', text);

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(jsonText);
    console.log('🔍 [GEMINI] Parsed JSON:', JSON.stringify(parsed, null, 2));

    const validated = SceneSchema.parse(parsed);
    console.log('✅ [GEMINI] Validated scene:', JSON.stringify(validated, null, 2));

    return validated as SceneJSON;
  } catch (error) {
    console.error('❌ [GEMINI] Analysis error:', error);
    throw new Error('Vision analysis failed');
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(GOOGLE_API_KEY);
}
