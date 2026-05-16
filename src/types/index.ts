import { z } from "zod";

export const TASTE_TAGS = [
  "balanced",
  "rich",
  "sour",
  "thin",
  "astringent",
  "muddy",
] as const;

export type TasteTag = (typeof TASTE_TAGS)[number];

export const ROAST_LEVELS = ["light", "medium", "medium-dark", "dark"] as const;

// Example grind curve:
// [
//   { step: 10, microns: 250 },
//   { step: 11, microns: 300 },
//   { step: 12, microns: 380 },
// ]
export const GrindPointSchema = z.object({
  step: z.number().nonnegative(),
  microns: z.number().positive(),
});

export const GrinderRangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().positive(),
}).refine((r) => r.max > r.min, { message: "max must be greater than min" });

export const GrinderSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  isDefault: z.boolean().optional(),
  micronsPerUnit: z.number().positive().optional(),
  subunitsPerUnit: z.number().int().positive().optional(),
  range: GrinderRangeSchema.optional(),
  // optional represent nonlinear stuff like with canonical grinders
  grindCurve: z
    .array(GrindPointSchema)
    .min(2, "need at least 2 points for interpolation")
    .refine(
      (points) => {
        const seen = new Set<number>();
        for (let i = 0; i < points.length; i++) {
          const current = points[i];
          if (seen.has(current.step)) return false;
          seen.add(current.step);
          if (i > 0 && current.step <= points[i - 1].step) return false;
        }
        return true;
      },
      { message: "steps must be unique and strictly increasing" }
    )
    .optional(),
});
export const BREW_METHODS = [
  "Espresso",
  "French Press",
  "Pour Over",
  "AeroPress",
  "Moka Pot",
  "Cold Brew",
  "Drip",
  "Chemex",
  "Siphon",
  "Turkish",
  "Other",
] as const;

export type BrewMethod = (typeof BREW_METHODS)[number];

export const BrewerSchema = z.object({
  id: z.string(),
  name: z.string(),
  method: z.enum(BREW_METHODS).optional(),
  shortName: z.string().optional(),
});

export const GrindSizeSchema = z.object({
  primary: z.number().int().positive(),
  secondary: z.number().int().nonnegative().default(0),
});

export const GrindSizeEntrySchema = z.object({
  grinderId: z.string(),
  brewerId: z.string(),
  grindSize: GrindSizeSchema,
});

export const BeanSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  origin: z.string().optional(),
  roastDate: z.string().optional(),
  roastLevel: z.enum(ROAST_LEVELS).optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export const BeanInputSchema = BeanSchema.omit({ id: true, createdAt: true });

export const BrewingInfoSchema = z.object({
  date: z.string(),
  beanId: z.string().min(1, "Bean is required"),
  brewerId: z.string().min(1, "Brewer is required"),
  grinderId: z.string().optional(),
  waterG: z.number().positive(),
  brewRatio: z.number().positive(),
  grindSize: GrindSizeSchema,
  brewTimeMins: z.number().nonnegative(),
  waterTempC: z.number().optional(),
  notes: z.string().optional(),
});

export const PostBrewEvaluationSchema = z.object({
  quality: z.number().min(1).max(5).optional(),
  tasteTags: z.array(z.enum(TASTE_TAGS)),
  vibes: z.string().optional(),
  sweetnessLevel: z.number().min(1).max(5).optional(),
});

export const BrewSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  brewingInfo: BrewingInfoSchema,
  postBrewEvaluation: PostBrewEvaluationSchema,
});

export const BrewInputSchema = BrewSchema.omit({ id: true, createdAt: true });

export const SettingsSchema = z.object({
  defaultBrewer: z.string().optional(),
  defaultGrinder: z.string().optional(),
  grindSizeMatrix: z.array(GrindSizeEntrySchema).default([]),
});

export type GrindPoint = z.infer<typeof GrindPointSchema>;
export type GrinderRange = z.infer<typeof GrinderRangeSchema>;
export type GrindSize = z.infer<typeof GrindSizeSchema>;
export type Grinder = z.infer<typeof GrinderSchema>;
export type Brewer = z.infer<typeof BrewerSchema>;
export type GrindSizeEntry = z.infer<typeof GrindSizeEntrySchema>;
export type Bean = z.infer<typeof BeanSchema>;
export type BeanInput = z.infer<typeof BeanInputSchema>;
export type Brew = z.infer<typeof BrewSchema>;
export type BrewInput = z.infer<typeof BrewInputSchema>;
export type BrewingInfo = z.infer<typeof BrewingInfoSchema>;
export type PostBrewEvaluation = z.infer<typeof PostBrewEvaluationSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
