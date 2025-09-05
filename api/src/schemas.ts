import * as z from "zod/v4";

export const JobSchema = z.object({
  title: z.string(),
  url: z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain
  }),
  date_posted: z.iso.date(),
  location: z.string(),
  min_salary: z.int().nonnegative().nullable(),
  max_salary: z.int().nonnegative().nullable(),
  rating: z.number().min(0).max(10),
  company: z.string(),
});

export const ApplicationSchema = z.object({
  applied_date: z.iso.date().optional(),
  feeling: z.string().max(50).optional(),
})

export const UserSchema = z.object({
  google_id: z.string(),
  email: z.email(),
  name: z.string().min(2).max(100).optional(),
  picture: z.string().length(2).optional(),
  created_at: z.date().default(() => new Date()),
});

export const AppWithJobSchema = z.object({
  ...ApplicationSchema.shape,
  job: JobSchema,
})
