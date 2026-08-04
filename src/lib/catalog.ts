import { z } from "zod";
import catalogFile from "../../data/rackets.json";

export const racketSchema = z.object({
  id: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  headSizeIn2: z.number().positive(),
  weightGrams: z.number().positive(), // strung
  balance: z.string(),
  balancePoints: z.number().nullable(), // negative = head light
  stiffnessRA: z.number().nullable(),
  stringPattern: z.string(),
  swingweight: z.number().nullable(),
  priceUSD: z.number().positive(),
  imageUrl: z.string().url(),
  productUrl: z.string().url(),
});

export type Racket = z.infer<typeof racketSchema>;

export const catalogSchema = z.object({
  version: z.number(),
  updatedAt: z.string(),
  source: z.string(),
  rackets: z.array(racketSchema).min(1),
});

let cached: Racket[] | null = null;

export function loadCatalog(): Racket[] {
  if (!cached) {
    cached = catalogSchema.parse(catalogFile).rackets;
  }
  return cached;
}
