import { z } from "zod";
import { gameSchema } from "./types";

export function checkWinCondition(
  board: z.infer<typeof gameSchema.shape.board>
): 0 | 1 | -1 {
  // rows
  for (let i = 0; i < 3; i++) {
    if (checkRow(i)) return board[i][0];
  }

  // columns
  for (let i = 0; i < 3; i++) {
    if (checkColumn(i)) return board[0][i];
  }

  // diagonals
  if (board[1][1] === 0) return 0;
  if (board[0][0] === board[1][1] && board[1][1] === board[2][2])
    return board[1][1];
  if (board[0][2] === board[1][1] && board[1][1] === board[2][0])
    return board[1][1];

  return 0;

  // utils
  function checkRow(n: number) {
    return (
      board[n].every((slot) => slot === 1) ||
      board[n].every((slot) => slot === -1)
    );
  }
  function checkColumn(n: number) {
    return (
      board[0][n] === board[1][n] &&
      board[1][n] === board[2][n] &&
      board[0][n] !== 0
    );
  }
}
