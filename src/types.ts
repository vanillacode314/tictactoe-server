import { z } from "zod";

export const messageTypeSchema = z.enum(["HOST", "JOIN", "MOVE", "RESTART"]);
export const messageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(messageTypeSchema.Values.HOST) }),
  z.object({ type: z.literal(messageTypeSchema.Values.RESTART) }),
  z.object({
    type: z.literal(messageTypeSchema.Values.JOIN),
    gameId: z.string(),
  }),
  z.object({
    type: z.literal(messageTypeSchema.Values.MOVE),
    position: z.tuple([
      z.tuple([z.number(), z.number()]),
      z.tuple([z.number(), z.number()]),
    ]),
  }),
]);

export const responseTypeSchema = z.enum([
  "NEW_GAME",
  "JOINED",
  "MOVE",
  "GAME_OVER",
  "RESTART",
]);
export const responseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(responseTypeSchema.Values.NEW_GAME),
    gameId: z.string(),
  }),
  z.object({ type: z.literal(responseTypeSchema.Values.RESTART) }),
  z.object({
    type: z.literal(responseTypeSchema.Values.JOINED),
    sign: z.enum(["X", "O"]),
  }),
  z.object({
    type: z.literal(responseTypeSchema.Values.GAME_OVER),
    who: z.literal(0).or(z.literal(1)).or(z.literal(-1)),
  }),
  z.object({
    type: z.literal(responseTypeSchema.Values.MOVE),
    position: z.tuple([
      z.tuple([z.number(), z.number()]),
      z.tuple([z.number(), z.number()]),
    ]),
  }),
]);

export const playerSchema = z.object({
  id: z.string().nullable(),
  socket: z.any(),
});

export const boardSlotSchema = z
  .union([z.literal(0), z.literal(1), z.literal(-1)])
  .default(0);
export const gameSchema = z.object({
  players: z
    .tuple([playerSchema.nullable(), playerSchema.nullable()])
    .default([null, null]),
  board: z
    .tuple([
      z.tuple([boardSlotSchema, boardSlotSchema, boardSlotSchema]),
      z.tuple([boardSlotSchema, boardSlotSchema, boardSlotSchema]),
      z.tuple([boardSlotSchema, boardSlotSchema, boardSlotSchema]),
    ])
    .default([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]),
});

declare global {
  type TMessageType = z.infer<typeof messageTypeSchema>;
  type TMessage = z.infer<typeof messageSchema>;
  type TResponseType = z.infer<typeof responseTypeSchema>;
  type TResponse = z.infer<typeof responseSchema>;
  type TPlayer = z.infer<typeof playerSchema>;
  type TGame = z.infer<typeof gameSchema>;
}
