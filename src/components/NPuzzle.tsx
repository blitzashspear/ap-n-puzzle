import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Client } from "archipelago.js";
import { NPuzzleSlotData } from "../types/NPuzzleSlotData";
import APIcon from "../images/APIcon.png";

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

type NPuzzleBoardProps = {
    client: Client;
    slotData: NPuzzleSlotData;
};

export function NPuzzle({ client, slotData }: NPuzzleProps): JSX.Element {
    if (!client.authenticated || !slotData) {
        return <></>;
    }
    return <NPuzzleBoard client={client} slotData={slotData} />;
}

function NPuzzleBoard({ client, slotData }: NPuzzleBoardProps): JSX.Element {
    const size = slotData.size;
    const dimSize = Math.sqrt(size);
    const [puzzle, setPuzzle] = useState<number[][]>(slotData.puzzle.map(row => [...row]));
    const [revealed, setRevealed] = useState<string[]>([]);
    const goalPuzzle: number[][] = [];
    let count = 1;
    for (let i = 0; i < dimSize; i++) {
        goalPuzzle.push([]);

        for (let j = 0; j < dimSize; j++) {
            if (i * dimSize + j === size - 1) {
                goalPuzzle[i].push(0);
            } else {
                goalPuzzle[i].push(count++);
            }
        }
    }

    useEffect(() => {
        const handleItemsReceived = () => {
            const allItems = client.items.received.map(item => item.name);
            const items = allItems.filter(item => /^\d+$/.test(item));
            setRevealed(items);
        };

        handleItemsReceived();
        client.items.on("itemsReceived", handleItemsReceived);

        return () => {
            client.items.off("itemsReceived", handleItemsReceived);
        };
    }, [client]);

    useEffect(() => {
        checkPuzzle(puzzle);
    }, [puzzle, revealed]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            let emptyRow = -1;
            let emptyCol = -1;
            for (let i = 0; i < dimSize; i++) {
                for (let j = 0; j < dimSize; j++) {
                    if (puzzle[i][j] === 0) {
                        emptyRow = i;
                        emptyCol = j;
                        break;
                    }
                }
            }
            switch (event.key) {
                case "ArrowLeft":
                    if (emptyCol < dimSize - 1) {
                        movePuzzle(emptyRow, emptyCol + 1);
                    }
                    break;
                case "ArrowRight":
                    if (emptyCol > 0) {
                        movePuzzle(emptyRow, emptyCol - 1);
                    }
                    break;
                case "ArrowUp":
                    if (emptyRow < dimSize - 1) {
                        movePuzzle(emptyRow + 1, emptyCol);
                    }
                    break;
                case "ArrowDown":
                    if (emptyRow > 0) {
                        movePuzzle(emptyRow - 1, emptyCol);
                    }
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [puzzle, dimSize]);

    function checkPuzzle(board: number[][] = puzzle) {
        let totalSolved = 0;
        for (let i = 0; i < dimSize; i++) {
            for (let j = 0; j < dimSize; j++) {
                if (revealed.includes(board[i][j].toString()) && board[i][j] === goalPuzzle[i][j]) {
                    client.check(board[i][j]);
                    totalSolved++;
                }
            }
        }
        client.check(1000 + totalSolved);
        if (totalSolved == size - 1) {
            client.goal();
        }
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
    }

    function cellContent(value: number): React.ReactNode {
        if (value === 0) {
            return "";
        } else if (revealed.includes(value.toString())) {
            return value;
        }
        return <img src={APIcon} alt="Unrevealed Cell" className="PuzzleCellImage" />;
    }

    return (
        <div className="NPuzzleContainer">
            <div
                className="PuzzleUI"
                style={{
                    gridTemplateColumns: gridSizes[size],
                    gridTemplateRows: gridSizes[size]
                }}
            >
                {puzzle.map((row, rowIndex) => row.map((value, colIndex) =>
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`Size-${size}`}
                        onClick={() => movePuzzle(rowIndex, colIndex)}
                    >
                        {cellContent(value)}
                    </div>
                ))}
            </div>
            <Button className="ButtonAP" onClick={() => setPuzzle(slotData.puzzle.map(row => [...row]))}>
                RESET PUZZLE
            </Button>
        </div>
    );
}