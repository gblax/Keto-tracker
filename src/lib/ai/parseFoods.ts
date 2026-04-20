import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { SYSTEM_PROMPT, EXTRACT_FOODS_TOOL } from './prompt';

export const ParsedFoodItemSchema = z.object({
  name: z.string().min(1),
  quantity_text: z.string().optional(),
  grams_estimate: z.number().nonnegative(),
  net_carbs_g: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export const ParseResultSchema = z.object({
  items: z.array(ParsedFoodItemSchema),
});

export type ParsedFoodItem = z.infer<typeof ParsedFoodItemSchema>;
export type ParseResult = z.infer<typeof ParseResultSchema>;

export const MODEL_ID = 'claude-haiku-4-5-20251001';

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Anthropic API key configured. Paste one in Settings to enable AI parsing.');
    this.name = 'MissingApiKeyError';
  }
}

export async function parseFoods(text: string, apiKey: string): Promise<ParseResult> {
  if (!apiKey) throw new MissingApiKeyError();
  const trimmed = text.trim();
  if (!trimmed) return { items: [] };

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const res = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_FOODS_TOOL],
    tool_choice: { type: 'tool', name: 'extract_foods' },
    messages: [{ role: 'user', content: trimmed }],
  });

  const toolUse = res.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Claude response did not include a tool_use block');
  }
  return ParseResultSchema.parse(toolUse.input);
}
