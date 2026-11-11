import React, { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { Client } from "archipelago.js";
import { NPuzzleSlotData } from "../types/NPuzzleSlotData";
import APIcon from "../images/APIcon.png";

const SOUND_MOVE_SQUARE = `${process.env.PUBLIC_URL}/sounds/MoveSquare.wav`;
const SOUND_ILLEGAL_MOVE = `${process.env.PUBLIC_URL}/sounds/IllegalMove.wav`;
const SOUND_RESET_PUZZLE = `${process.env.PUBLIC_URL}/sounds/ResetPuzzle.wav`;
const SOUND_PUZZLE_GOAL = `${process.env.PUBLIC_URL}/sounds/PuzzleGoaled.wav`;

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
const COOLDOWN_DEATH_LINK = 30000; // 30s
const COOLDOWN_DEATH_LINK_MSG = 5000; // 5s
const COOLDOWN_DATA_STORAGE = 3000; // 3s

type NPuzzleProps = {
    client: Client;
    slotData: NPuzzleSlotData | null;
};

type NPuzzleBoardProps = {
    client: Client;
    slotData: NPuzzleSlotData;
    loadedPuzzle: number[][];
};

export function NPuzzle({ client, slotData }: NPuzzleProps): JSX.Element {
    const [storedPuzzle, setStoredPuzzle] = useState<number[][] | null>(null);

    useEffect(() => {
        if (!client.authenticated || !slotData) {
            setStoredPuzzle(null);
            return;
        }
        setStoredPuzzle(null);
        client.storage.fetch<number[][]>("puzzle").then(storedPuzzle => {
            console.log(storedPuzzle);
            setStoredPuzzle(storedPuzzle ?? slotData.puzzle);
        }).catch(() => {
            setStoredPuzzle(slotData.puzzle);
        });
    }, [client, slotData]);

    if (!client.authenticated || !slotData || !storedPuzzle) {
        return <></>;
    }
    return <NPuzzleBoard client={client} slotData={slotData} loadedPuzzle={storedPuzzle} />;
}

function NPuzzleBoard({ client, slotData, loadedPuzzle }: NPuzzleBoardProps): JSX.Element {
    const size = slotData.size;
    const dimSize = Math.sqrt(size);
    const [puzzle, setPuzzle] = useState<number[][]>(loadedPuzzle.map(row => [...row]));
    const [revealed, setRevealed] = useState<string[]>([]);
    const [checkedLocations, setCheckedLocations] = useState<number[]>(client.room.checkedLocations);
    const [deathLinkMessage, setDeathLinkMessage] = useState("");
    const [soundsMuted, setSoundsMuted] = useState(false);
    const lastDeathLink = useRef(0);
    const puzzleDone = useRef(false);
    const [killResetButton, setKillResetButton] = useState(false);
    const goalPuzzle = Array.from({ length: dimSize }, (_, row) =>
        Array.from({ length: dimSize }, (_, col) => {
            const value = row * dimSize + col + 1;
            return value === size ? 0 : value;
        })
    );

    useEffect(() => {
        const handleItemsReceived = () => {
            const allItems = client.items.received.map(item => item.name);
            // Adios filler items, and just convert the item name to its number.
            const items = allItems
                .map(item => /^Unlock (\d+)$/.exec(item)?.[1])
                .filter((item): item is string => item !== undefined);
            setRevealed(items);
        };
        const handleLocationsChecked = () => {
            setCheckedLocations(client.room.checkedLocations);
        };

        handleItemsReceived();
        handleLocationsChecked();
        client.items.on("itemsReceived", handleItemsReceived);
        client.room.on("locationsChecked", handleLocationsChecked);

        return () => {
            client.items.off("itemsReceived", handleItemsReceived);
            client.room.off("locationsChecked", handleLocationsChecked);
        };
    }, [client]);

    useEffect(() => {
        if (!slotData.deathLink) return;
        let deathLinkMessageTimeout: ReturnType<typeof setTimeout>;
        const handleDeathLink = (source: string, _time: number, cause?: string) => {
            resetPuzzle();
            setDeathLinkMessage(cause || `${source} died!`);
            if (deathLinkMessageTimeout) {
                clearTimeout(deathLinkMessageTimeout);
            }
            deathLinkMessageTimeout = setTimeout(() => {
                setDeathLinkMessage("");
            }, COOLDOWN_DEATH_LINK_MSG);
        };

        client.deathLink.on("deathReceived", handleDeathLink);

        return () => {
            client.deathLink.off("deathReceived", handleDeathLink);
            if (deathLinkMessageTimeout) {
                clearTimeout(deathLinkMessageTimeout);
            }
        };
    }, [client]);

    useEffect(() => {
        checkPuzzle(puzzle);
    }, [puzzle, revealed]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            client.storage
                .prepare("puzzle", puzzle)
                .replace(puzzle)
                .commit();
        }, COOLDOWN_DATA_STORAGE);

        return () => clearTimeout(timeout);
    }, [client, puzzle]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [puzzle]);

    //helper function to reduce volume because by jove bfxr sounds are LOUD
    function playSound(src: string) {
        if (soundsMuted) {
            return;
        }
        const audio = new Audio(src);
        audio.volume = 0.5;
        void audio.play();
    }

    // ah yes the one function where i used actual for loops.
    function checkPuzzle(board: number[][] = puzzle) {
        let totalSolved = 0;
        for (let i = 0; i < dimSize; i++) {
            for (let j = 0; j < dimSize; j++) {
                const val = board[i][j];
                if (revealed.includes(val.toString()) && val === goalPuzzle[i][j]) {
                    if (!checkedLocations.includes(val)) {
                        client.check(val);
                    }
                    totalSolved++;
                }
            }
        }
        for (let i = 1; i <= totalSolved; i++) {
            client.check(1000 + i);
        }
        if (totalSolved === size - 1 && !puzzleDone.current) {
            playSound(SOUND_PUZZLE_GOAL);
            puzzleDone.current = true;
            setKillResetButton(true);
            client.goal();
        }
    }

    function movePuzzle(row: number, col: number) {
        if (puzzle[row][col] == 0 || puzzleDone.current) {
            // Bro you clicked the blank tile.
            // okay or the puzzle literally doesnt need to be moved anymore, smartass.
            return;
        }
        const newPuzzle = puzzle.map(row => [...row]);
        const theTime = Date.now();
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

        // Found 0, otherwise nuke entire multiworld.
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
            playSound(SOUND_MOVE_SQUARE);
        } else if (slotData.deathLink && theTime - lastDeathLink.current >= COOLDOWN_DEATH_LINK) {
            lastDeathLink.current = theTime;
            client.deathLink.sendDeathLink(client.name, `${client.name} made an invalid move.`);
            playSound(SOUND_ILLEGAL_MOVE);
        }
        setPuzzle(newPuzzle);
    }

    // Moving a cell with arrow keys means the cell is going into the blank space.
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
        if (revealed.includes(value.toString())) {
            return value;
        }
        return <img src={APIcon} alt="Unrevealed Cell" className="PuzzleCellImage" />;
    }

    function resetPuzzle() {
        setPuzzle(slotData.puzzle.map(row => [...row]));
        playSound(SOUND_RESET_PUZZLE);
    }

    return (
        <div className="NPuzzleContainer">
            {deathLinkMessage}
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
                        style={{ color: checkedLocations.includes(value) ? "yellowgreen" : undefined }}
                    >
                        {cellContent(value)}
                    </div>
                ))}
            </div>
            <div className="Settings">
                <Button
                    className="ButtonAP"
                    onClick={() => resetPuzzle()}
                    disabled={killResetButton}>
                    RESET PUZZLE
                </Button>
                <Button
                    className="ButtonAP"
                    onClick={() => {
                        setSoundsMuted(!soundsMuted);
                    }}>
                    {soundsMuted ? "UNMUTE" : "MUTE"}
                </Button>
            </div>
        </div>
    );
}
