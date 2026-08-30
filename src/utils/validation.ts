import { z } from 'zod';

/**
 * Schema for individual draft items
 */
export const DraftSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  markdown: z.string(),
  updatedAt: z.number().int().positive(),
});

/**
 * Schema for the drafts array stored in localStorage
 */
export const DraftsArraySchema = z.array(DraftSchema);

/**
 * Type inference for Draft
 */
export type ValidatedDraft = z.infer<typeof DraftSchema>;

/**
 * Validates data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Unknown data to validate
 * @param context - Context string for error logging
 * @returns Validated data or null if invalid
 */
function validate<T>(schema: z.ZodType<T>, data: unknown, context: string): T | null {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn(`[validation] ${context} failed:`, result.error.issues);
  return null;
}

/**
 * Validates and sanitizes draft data from localStorage
 * @param data - Unknown data to validate
 * @returns Validated drafts array or null if invalid
 */
export function validateDrafts(data: unknown): ValidatedDraft[] | null {
  return validate(DraftsArraySchema, data, 'Drafts validation');
}

/**
 * Validates a single draft
 * @param data - Unknown data to validate
 * @returns Validated draft or null if invalid
 */
export function validateSingleDraft(data: unknown): ValidatedDraft | null {
  return validate(DraftSchema, data, 'Single draft validation');
}
