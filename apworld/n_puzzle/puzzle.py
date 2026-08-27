from __future__ import annotations
from typing import TYPE_CHECKING
from .__init__ import OPTION_TO_SIZE
if TYPE_CHECKING:
    from .__init__ import NPuzzleWorld

def generate_puzzle(world: NPuzzleWorld):
    puzzle = []
    n_size = OPTION_TO_SIZE[world.options.size]
    dim_size = int(n_size**0.5)

    # Initial puzzle.
    count = 1
    for i in range(dim_size):
        puzzle.append([])
        for j in range(dim_size):
            if i*dim_size+j == n_size-1:
                puzzle[i].append(0)
            else:
                puzzle[i].append(count)
                count += 1

    # Performing a shit ton of moves on the puzzle.
    # This randomizes it and keeps it valid. I won't have to perform an inversion check.
    zero_row = dim_size-1
    zero_column = dim_size-1
    for _ in range(n_size*1000):
        valid_moves = ["up", "down", "left", "right"]
        if zero_row == 0:
            valid_moves.remove("up")
        elif zero_row == dim_size-1:
            valid_moves.remove("down")
        if zero_column == 0:
            valid_moves.remove("left")
        elif zero_column == dim_size-1:
            valid_moves.remove("right")
        move = world.random.choice(valid_moves)
        match move:
            case "up":
                puzzle[zero_row][zero_column] = puzzle[zero_row-1][zero_column]
                puzzle[zero_row-1][zero_column] = 0
                zero_row -= 1
            case "down":
                puzzle[zero_row][zero_column] = puzzle[zero_row+1][zero_column]
                puzzle[zero_row+1][zero_column] = 0
                zero_row += 1
            case "left":
                puzzle[zero_row][zero_column] = puzzle[zero_row][zero_column-1]
                puzzle[zero_row][zero_column-1] = 0
                zero_column -= 1
            case "right":
                puzzle[zero_row][zero_column] = puzzle[zero_row][zero_column+1]
                puzzle[zero_row][zero_column+1] = 0
                zero_column += 1

    return puzzle
