import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import APIcon from "../images/APIcon.png";

const MOVE_SQUARE_SOUND = `${process.env.PUBLIC_URL}/sounds/MoveSquare.wav`;
const ILLEGAL_MOVE_SOUND = `${process.env.PUBLIC_URL}/sounds/IllegalMove.wav`;
const PUZZLE_GOAL_SOUND = `${process.env.PUBLIC_URL}/sounds/PuzzleGoaled.wav`;

function playSound(src: string) {
    const audio = new Audio(src);
    audio.volume = 0.5;
    void audio.play();
}

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

// IF MY DEMO STUFF SHOWS UP IN PROD I WILL DIE
export function DemoPuzzle(): JSX.Element {
    const [size, setSize] = useState(9);
    const dimSize = Math.sqrt(size);
    const [showLogo, setShowLogo] = useState(false);
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
        if (puzzle[row][col] == 0) {
            return;
        }
        const newPuzzle = puzzle.map(row => [...row]);
        const targetDirections = [];
        for (let i = 0; i < size; i++) {
            targetDirections.push(
                { row: row - i, col },
                { row: row + i, col },
                { row, col: col - i },
                { row, col: col + i }
            );
        }
        const target = targetDirections.find(
            ({ row: targetRow, col: targetCol }) =>
                newPuzzle[targetRow]?.[targetCol] === 0
        );

        if (target) {
            let currRow = target.row;
            let currCol = target.col;
            while (currRow !== row || currCol !== col) {
                const nextRow = currRow + Math.sign(row - currRow);
                const nextCol = currCol + Math.sign(col - currCol);
                newPuzzle[currRow][currCol] = newPuzzle[nextRow][nextCol];
                currRow = nextRow;
                currCol = nextCol;
            }
            newPuzzle[row][col] = 0;
            playSound(MOVE_SQUARE_SOUND);
        } else {
            playSound(ILLEGAL_MOVE_SOUND);
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
        if (showLogo) {
            return <img src={APIcon} alt="Archipelago logo" className="PuzzleCellImage" />;
        }
        return value;
    }

    function changePuzzleSize(newSize: number) {
        setSize(newSize);
        const newPuzzle = generatePuzzle(newSize);
        let blankRow = newPuzzle.findIndex(row => row.includes(0));
        let blankCol = newPuzzle[blankRow].indexOf(0);

        for (let move = 0; move < 100 * size; move++) {
            const possibleMoves = [
                { row: blankRow - 1, col: blankCol },
                { row: blankRow + 1, col: blankCol },
                { row: blankRow, col: blankCol - 1 },
                { row: blankRow, col: blankCol + 1 }
            ].filter(({ row, col }) => newPuzzle[row]?.[col] !== undefined);
            const target = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

            newPuzzle[blankRow][blankCol] = newPuzzle[target.row][target.col];
            newPuzzle[target.row][target.col] = 0;
            blankRow = target.row;
            blankCol = target.col;
        }

        setPuzzle(newPuzzle);
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
            <div>
                <div className="DemoPuzzleButtons">
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
                </div>
                <div className="DemoPuzzleButtons">
                    <Button
                        className="ButtonAP"
                        onClick={() => {
                            setPuzzle(initPuzzle);
                            playSound(PUZZLE_GOAL_SOUND);
                        }}
                    >
                        SOLVE
                    </Button>
                    <Button className="ButtonAP" onClick={() => setShowLogo(!showLogo)}>
                        {showLogo ? "NUMBERS" : "LOGO"}
                    </Button>
                </div>
                <div className="Settings">
                    <Button className="ButtonAP">
                        RESET PUZZLE
                    </Button>
                    <Button className="ButtonAP">
                        MUTE
                    </Button>
                </div>
            </div>
        </div>
    );
}
