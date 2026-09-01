import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Client } from "archipelago.js";
import { NPuzzleSlotData } from "../types/NPuzzleSlotData";

const gridSizes: Record<number, string> = {
    9: "repeat(3, 150px)",
    16: "repeat(4, 120px)",
    25: "repeat(5, 100px)",
    36: "repeat(6, 80px)"
};

type NPuzzleProps = {
    client: Client;
    slotData: NPuzzleSlotData | null;
};

export function NPuzzle({ client, slotData }: NPuzzleProps): JSX.Element {
    if (!client.authenticated || !slotData) {
        return <></>;
    }
    const size = slotData.size;
    const dim_size = size / size;
    const [puzzle, setPuzzle] = useState<number[][]>(slotData.puzzle.map(row => [...row]));
    const initialPuzzle = puzzle.map(row => [...row]);
    const [revealed, setRevealed] = useState<string[]>(["0"]);
    const goalPuzzle: number[][] = [];
    let count = 1;
    for (let i = 0; i < dim_size; i++) {
        goalPuzzle.push([]);

        for (let j = 0; j < dim_size; j++) {
            if (i * dim_size + j === size - 1) {
                goalPuzzle[i].push(0);
            } else {
                goalPuzzle[i].push(count++);
            }
        }
    }

    useEffect(() => {
        const allItems = client.items.received.map(item => item.name);
        const items = allItems.filter(item => /^\d+$/.test(item));
        setRevealed(items);
    }, [client]);

    function checkPuzzle(board: number[][], goal: number[][]) {
        let totalSolved = 0;
        for (let i = 0; i < dim_size; i++) {
            for (let j = 0; j < dim_size; j++) {
                if (revealed.includes(board[i][j].toString()) && board[i][j] === goal[i][j]) {
                    client.check(board[i][j]);
                    totalSolved++;
                }
            }
        }
        client.check(1000 + totalSolved);
    }

    function movePuzzle(row: number, col: number) {
        const newPuzzle = puzzle.map(row => [...row]);
        const targetDirections = [
            { row: row - 1, col: col },
            { row: row + 1, col: col },
            { row: row, col: col - 1 },
            { row: row, col: col + 1 }
        ];
        targetDirections.forEach(({ row: targetRow, col: targetCol }) => {
            if (newPuzzle[targetRow]?.[targetCol] === 0) {
                newPuzzle[targetRow][targetCol] = newPuzzle[row][col];
                newPuzzle[row][col] = 0;
            }
        });
        setPuzzle(newPuzzle);
        checkPuzzle(puzzle, goalPuzzle);
    }

    return (
        <div className="NPuzzleContainer">
            <div className="PuzzleUI" style={{ gridTemplateColumns: gridSizes[size], gridTemplateRows: gridSizes[size] }}>
                {puzzle.map((row, rowIndex) =>
                    row.map((value, colIndex) => {
                        return (
                            <div
                                key={value}
                                className={`Size-${size}`}
                                onClick={() => movePuzzle(rowIndex, colIndex)}
                            >
                                {value === 0 ? "" : revealed.includes(value.toString()) ? value : "?"}
                            </div>
                        );
                    })
                )}
            </div>
            <Button className="ButtonAP" onClick={() => setPuzzle(initialPuzzle.map(row => [...row]))}>
                RESET PUZZLE
            </Button>
        </div>
    );
}