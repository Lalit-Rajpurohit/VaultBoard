import { z } from 'zod';

/** Zod schemas used to validate writes before they hit the DB layer. */

export const noteInputSchema = z.object({
  title: z.string().trim().max(120, 'Title is too long'),
  bodyMd: z.string().max(100_000, 'Note is too large'),
  folderId: z.string().nullable().optional(),
});
export type NoteInput = z.infer<typeof noteInputSchema>;

export const cardInputSchema = z.object({
  title: z.string().trim().min(1, 'Card needs a title').max(120),
  description: z.string().max(10_000).optional().default(''),
  priority: z.number().int().min(0).max(3).default(0),
  dueAt: z.number().nullable().optional(),
});
export type CardInput = z.infer<typeof cardInputSchema>;

export const tagNameSchema = z
  .string()
  .trim()
  .min(1, 'Tag cannot be empty')
  .max(32, 'Tag is too long')
  .regex(/^[^\s#]+$/, 'No spaces or # in tags');

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, 'Task needs a title').max(160),
  priority: z.number().int().min(0).max(3).default(0),
  dueAt: z.number().nullable().optional(),
});
export type TaskInput = z.infer<typeof taskInputSchema>;
