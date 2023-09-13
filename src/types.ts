import { z } from "zod";

export const messageTypeSchema = z.enum(["HOST", "JOIN", "MOVE"]);
export const messageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(messageTypeSchema.Values.HOST) }),
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

export const responseTypeSchema = z.enum(["NEW_GAME", "JOINED", "MOVE"]);
export const responseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(responseTypeSchema.Values.NEW_GAME),
    gameId: z.string(),
  }),
  z.object({
    type: z.literal(responseTypeSchema.Values.JOINED),
    sign: z.enum(["X", "O"]),
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
  socket: z.object({ send: z.function().args(z.string()).returns(z.void()) }),
});
export const gameSchema = z.map(
  z.string(),
  z.object({
    playerIds: z
      .tuple([playerSchema.nullable(), playerSchema.nullable()])
      .default([null, null]),
  })
);

declare global {
  type TMessageType = z.infer<typeof messageTypeSchema>;
  type TMessage = z.infer<typeof messageSchema>;
  type TResponseType = z.infer<typeof responseTypeSchema>;
  type TResponse = z.infer<typeof responseSchema>;
  type TPlayer = z.infer<typeof playerSchema>;
  type TGame = z.infer<typeof gameSchema>;
}
