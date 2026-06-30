import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(1, "title is required"),
  priority: z.enum(["P0", "P1", "P2"]).nullable().optional(),
  owner: z.string().max(100).optional(),
});

export type CreateTicket = z.infer<typeof createTicketSchema>;

export const TicketPatchSchema = z
  .object({
    priority: z.enum(["P0", "P1", "P2"]).nullable().optional(),
    owner: z.string().max(100).nullable().optional(),
  })
  .refine(
    (data) => data.priority !== undefined || data.owner !== undefined,
    { message: "At least one field (priority or owner) must be provided" }
  );

export type TicketPatch = z.infer<typeof TicketPatchSchema>;
