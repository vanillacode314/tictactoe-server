import { v4 as uuidv4 } from "uuid";
import { Elysia, ws } from "elysia";
import { gameSchema, messageSchema, responseSchema } from "./types";
import { checkWinCondition } from "./logic";

const GAMES = new Map<string, TGame>();
const PLAYER_TO_GAME_MAP = new Map<string, string>();
const PLAYER_1 = 1;
const PLAYER_2 = -1;
const WIN = 1;
const DRAW = 0;
const LOSE = -1;

new Elysia()
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
        case "RESTART": {
          const gameData = GAMES.get(PLAYER_TO_GAME_MAP.get(playerId)!)!;
          respond(gameData.players[0]!.socket, data);
          respond(gameData.players[1]!.socket, data);
          gameData.board.forEach((row) => row.fill(0));
          break;
        }
        case "HOST": {
          const newGameId = uuidv4();
          GAMES.set(
            newGameId,
            gameSchema.parse({ players: [{ id: playerId, socket: ws }, null] }),
          );
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
          gameData.players[1] = {
            id: playerId,
            socket: ws,
          };
          PLAYER_TO_GAME_MAP.set(playerId, data.gameId);
          respond(ws, { type: "JOINED", sign: "○" });
          break;
        }
        case "MOVE": {
          if (!PLAYER_TO_GAME_MAP.has(playerId)) {
            ws.send("error");
            return;
          }
          const gameData = GAMES.get(PLAYER_TO_GAME_MAP.get(playerId)!)!;
          const currentPlayer =
            gameData.players.findIndex((p) => p!.id === playerId) === 0
              ? PLAYER_1
              : PLAYER_2;
          const otherPlayer = gameData.players.find(
            (player) => player!.id !== playerId,
          )!;
          respond(otherPlayer.socket, data);

          // check win conditions
          const [[x, y]] = data.position;
          gameData.board[x][y] = currentPlayer;
          const whoWon = checkWinCondition(gameData.board);
          if (whoWon === PLAYER_1) {
            respond(gameData.players[0]!.socket, {
              type: "GAME_OVER",
              who: WIN,
            });
            respond(gameData.players[1]!.socket, {
              type: "GAME_OVER",
              who: LOSE,
            });
            return;
          } else if (whoWon === PLAYER_2) {
            respond(gameData.players[0]!.socket, {
              type: "GAME_OVER",
              who: LOSE,
            });
            respond(gameData.players[1]!.socket, {
              type: "GAME_OVER",
              who: WIN,
            });
            return;
          }

          const isDraw = gameData.board.every((row) =>
            row.every((slot) => slot !== 0),
          );
          if (isDraw) {
            respond(gameData.players[0]!.socket, {
              type: "GAME_OVER",
              who: DRAW,
            });
            respond(gameData.players[1]!.socket, {
              type: "GAME_OVER",
              who: DRAW,
            });
            return;
          }
          break;
        }
      }
    },
    open() {
      console.log("new connection");
    },
    close() {},
  })
  .listen(3001, () => console.log("listening on http://localhost:3001"));

function respond(ws: { send: WebSocket["send"] }, message: TResponse) {
  const result = responseSchema.safeParse(message);
  if (!result.success) {
    ws.send(JSON.stringify(result.error));
    return;
  }
  ws.send(JSON.stringify(result.data));
}
