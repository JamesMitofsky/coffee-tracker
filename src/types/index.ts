import { z } from "zod";

export const TASTE_TAGS = [
  "balanced",
  "rich",
  "bitter",
  "sour",
  "thin",
  "astringent",
  "muddy",
  "sweet",
] as const;

export type TasteTag = (typeof TASTE_TAGS)[number];


export const ROAST_LEVELS = ["light", "medium", "medium-dark", "dark"] as const;

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

export const BrewSchema = z.object({
  id: z.string(),
  date: z.string(),
  beanId: z.string().min(1, "Bean is required"),
  brewer: z.string().min(1, "Brewer is required"),
  grinder: z.string().optional(),
  waterG: z.number().positive(),
  brewRatio: z.number().positive(),
  grindSize: z.number().positive(),
  brewTimeMins: z.number().nonnegative(),
  waterTempC: z.number().optional(),
  quality: z.number().min(1).max(5).optional(),
  tasteTags: z.array(z.enum(TASTE_TAGS)),
  notes: z.string().optional(),
  vibes: z.string().optional(),
  createdAt: z.string(),
});

export const BrewInputSchema = BrewSchema.omit({ id: true, createdAt: true });

export const SettingsSchema = z.object({
  preferredGrindSize: z.number().optional(),
  defaultBrewer: z.string().optional(),
  defaultGrinder: z.string().optional(),
});

export type Bean = z.infer<typeof BeanSchema>;
export type BeanInput = z.infer<typeof BeanInputSchema>;
export type Brew = z.infer<typeof BrewSchema>;
export type BrewInput = z.infer<typeof BrewInputSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
