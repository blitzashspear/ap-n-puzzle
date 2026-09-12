import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";

const GRID_TEMPLATES: Record<number, string> = {
    9: "repeat(3, 160px)",
    16: "repeat(4, 120px)",
    25: "repeat(5, 95px)",
    36: "repeat(6, 80px)",
    49: "repeat(7, 67px)",
    64: "repeat(8, 58px)",
    81: "repeat(9, 51px)",
    100: "repeat(10, 45px)"
};

export function DemoPuzzle(): JSX.Element {
    const [size, setSize] = useState(9);
    const dimSize = Math.sqrt(size);
    function generatePuzzle(puzzleSize: number): number[][] {
        const puzzleDimSize = Math.sqrt(puzzleSize);
        return Array.from({ length: puzzleDimSize }, (_, i) =>
            Array.from({ length: puzzleDimSize }, (_, j) => {
                const value = i * puzzleDimSize + j + 1;
                return value === puzzleSize ? 0 : value;
            })
        );
    }

    const initPuzzle = generatePuzzle(size);
    const [puzzle, setPuzzle] = useState<number[][]>(initPuzzle);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [puzzle, dimSize]);

    function movePuzzle(row: number, col: number) {
        const newPuzzle = puzzle.map(row => [...row]);
        const targetDirections = [
            { row: row - 1, col },
            { row: row + 1, col },
            { row, col: col - 1 },
            { row, col: col + 1 }
        ];
        const target = targetDirections.find(
            ({ row: targetRow, col: targetCol }) =>
                newPuzzle[targetRow]?.[targetCol] === 0
        );

        if (target) {
            newPuzzle[target.row][target.col] = newPuzzle[row][col];
            newPuzzle[row][col] = 0;
        }
        setPuzzle(newPuzzle);
    }

    function handleKeyDown(event: KeyboardEvent) {
        const emptyRow = puzzle.findIndex(row => row.includes(0));
        const emptyCol = puzzle[emptyRow].indexOf(0);
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
    }

    function cellContent(value: number): React.ReactNode {
        if (value === 0) {
            return "";
        }
        return value;
    }

    function changePuzzleSize(newSize: number) {
        setSize(newSize);
        setPuzzle(generatePuzzle(newSize));
    }

    function scramblePuzzle() {
        const scrambledPuzzle = puzzle.map(row => [...row]);
        let blankRow = scrambledPuzzle.findIndex(row => row.includes(0));
        let blankCol = scrambledPuzzle[blankRow].indexOf(0);

        for (let move = 0; move < 100 * size; move++) {
            const possibleMoves = [
                { row: blankRow - 1, col: blankCol },
                { row: blankRow + 1, col: blankCol },
                { row: blankRow, col: blankCol - 1 },
                { row: blankRow, col: blankCol + 1 }
            ].filter(({ row, col }) => scrambledPuzzle[row]?.[col] !== undefined);
            const target = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

            scrambledPuzzle[blankRow][blankCol] = scrambledPuzzle[target.row][target.col];
            scrambledPuzzle[target.row][target.col] = 0;
            blankRow = target.row;
            blankCol = target.col;
        }

        setPuzzle(scrambledPuzzle);
    }

    return (
        <div className="NPuzzleContainer">
            <div
                className="PuzzleUI"
                style={{
                    gridTemplateColumns: GRID_TEMPLATES[size],
                    gridTemplateRows: GRID_TEMPLATES[size]
                }}
            >
                {puzzle.map((row, rowIndex) => row.map((value, colIndex) =>
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`${value === 0 ? "PuzzleBlank" : ""} Size-${size}`}
                        onClick={() => movePuzzle(rowIndex, colIndex)}
                    >
                        {cellContent(value)}
                    </div>
                ))}
            </div>
            <div className="DemoPuzzleButtons" style={{ flexWrap: "wrap" }}>
                <Button className="ButtonAP" onClick={() => changePuzzleSize(9)}>
                    9
                </Button>
                <Button className="ButtonAP" onClick={() => changePuzzleSize(16)}>
                    16
                </Button>
                <Button className="ButtonAP" onClick={() => changePuzzleSize(25)}>
                    25
                </Button>
                <Button className="ButtonAP" onClick={() => changePuzzleSize(36)}>
                    36
                </Button>
                <Button className="ButtonAP" onClick={() => changePuzzleSize(49)}>
                    49
                </Button>
                <Button className="ButtonAP" onClick={() => changePuzzleSize(64)}>
                    64
                </Button>
                <Button className="ButtonAP" onClick={() => changePuzzleSize(81)}>
                    81
                </Button>
                <Button className="ButtonAP" onClick={() => changePuzzleSize(100)}>
                    100
                </Button>
                <Button className="ButtonAP" onClick={scramblePuzzle}>
                    SCRAMBLE
                </Button>
            </div>
        </div>
    );
}
