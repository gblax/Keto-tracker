export const SYSTEM_PROMPT = `You are a nutrition parser for a ketogenic diet tracker. Given a user's free-text description of what they ate, extract each distinct food item and estimate its net carbohydrate content.

Rules:
- Net carbs = total carbs − fiber − sugar alcohols. Count erythritol as 0. Count allulose as 0.
- If the user gives a count ("two eggs"), multiply per-unit values by that count.
- If quantity is ambiguous ("some rice", "a bit of"), assume a typical single serving and lower the confidence score.
- grams_estimate is the total grams for the portion described (not per-unit).
- confidence is 0–1: 1.0 = well-known, fixed-weight food; 0.3 = highly ambiguous; 0.5 = typical guess.
- Prefer short, human-readable names ("Avocado toast", not "Avocado with wheat bread slice").
- Never refuse. If nothing is parseable, return an empty items array.
- Do not add commentary. Only call the extract_foods tool.`;

export const EXTRACT_FOODS_TOOL = {
  name: 'extract_foods',
  description:
    'Return the list of foods parsed from the user input with net-carb estimates.',
  input_schema: {
    type: 'object' as const,
    properties: {
      items: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            name: {
              type: 'string' as const,
              description: 'Short, human-readable food name, e.g. "Avocado toast".',
            },
            quantity_text: {
              type: 'string' as const,
              description: 'Portion as the user said it, e.g. "2 eggs".',
            },
            grams_estimate: {
              type: 'number' as const,
              description: 'Estimated total grams for the described portion.',
            },
            net_carbs_g: {
              type: 'number' as const,
              description: 'Estimated net carbs in grams for the described portion.',
            },
            confidence: {
              type: 'number' as const,
              minimum: 0,
              maximum: 1,
            },
            notes: { type: 'string' as const },
          },
          required: ['name', 'grams_estimate', 'net_carbs_g', 'confidence'],
        },
      },
    },
    required: ['items'],
  },
};
