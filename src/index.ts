import { v4 as uuidv4 } from "uuid";
import { Elysia, ws } from "elysia";
import { messageSchema, responseSchema } from "./types";

const GAMES: TGame = new Map();
const PLAYER_TO_GAME_MAP = new Map<string, string>();

function respond(ws: { send: (_: string) => void }, message: TResponse) {
  const result = responseSchema.safeParse(message);
  if (!result.success) {
    ws.send(JSON.stringify(result.error));
    return;
  }
  ws.send(JSON.stringify(result.data));
}

const app = new Elysia()
  .use(ws())
  .ws("/", {
    message(ws, message) {
      const result = messageSchema.safeParse(message);
      if (!result.success) {
        ws.send(JSON.stringify(result.error));
        return;
      }
      const data = result.data;
      const playerId = ws.raw.data.id.toString();
      switch (data.type) {
        case "HOST": {
          const newGameId = uuidv4();
          GAMES.set(newGameId, {
            playerIds: [
              {
                id: playerId,
                socket: ws,
              },
              null,
            ],
          });
          PLAYER_TO_GAME_MAP.set(playerId, newGameId);
          respond(ws, { type: "NEW_GAME", gameId: newGameId });
          break;
        }
        case "JOIN": {
          if (!GAMES.has(data.gameId)) {
            ws.send("error");
            return;
          }
          const gameData = GAMES.get(data.gameId)!;
          gameData.playerIds[1] = {
            id: playerId,
            socket: ws,
          };
          PLAYER_TO_GAME_MAP.set(playerId, data.gameId);
          respond(ws, { type: "JOINED", sign: "O" });
          break;
        }
        case "MOVE": {
          if (!PLAYER_TO_GAME_MAP.has(playerId)) {
            ws.send("error");
            return;
          }
          const gameData = GAMES.get(PLAYER_TO_GAME_MAP.get(playerId)!)!;
          const otherPlayer = gameData.playerIds.find(
            (p) => p!.id !== playerId
          )!;
          respond(otherPlayer.socket, data);
          break;
        }
      }
    },
    open(ws) {
      console.log("new connection");
    },
    close(ws) {},
  })
  .listen(3000, () => console.log("listening on http://localhost:3000"));
