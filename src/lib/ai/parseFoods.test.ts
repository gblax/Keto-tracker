import { describe, it, expect } from 'vitest';
import { ParseResultSchema, ParsedFoodItemSchema } from './parseFoods';

describe('ParseResultSchema', () => {
  it('accepts a valid Claude tool-use payload', () => {
    const valid = {
      items: [
        {
          name: 'Scrambled eggs',
          quantity_text: '2 eggs',
          grams_estimate: 100,
          net_carbs_g: 1.2,
          confidence: 0.9,
        },
        {
          name: 'Banana',
          quantity_text: '1 medium',
          grams_estimate: 118,
          net_carbs_g: 24,
          confidence: 0.85,
          notes: 'Medium banana ~118g',
        },
      ],
    };
    const parsed = ParseResultSchema.parse(valid);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[0].name).toBe('Scrambled eggs');
  });

  it('accepts an empty items array', () => {
    expect(ParseResultSchema.parse({ items: [] })).toEqual({ items: [] });
  });

  it('rejects missing items field', () => {
    expect(() => ParseResultSchema.parse({})).toThrow();
  });

  it('rejects item with negative net carbs', () => {
    expect(() =>
      ParsedFoodItemSchema.parse({
        name: 'X',
        grams_estimate: 100,
        net_carbs_g: -5,
        confidence: 0.5,
      }),
    ).toThrow();
  });

  it('rejects confidence outside 0–1', () => {
    expect(() =>
      ParsedFoodItemSchema.parse({
        name: 'X',
        grams_estimate: 100,
        net_carbs_g: 5,
        confidence: 1.5,
      }),
    ).toThrow();
  });

  it('rejects missing required fields', () => {
    expect(() =>
      ParsedFoodItemSchema.parse({ name: 'X', grams_estimate: 100 }),
    ).toThrow();
  });
});
