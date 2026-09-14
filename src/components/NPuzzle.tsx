import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Client } from "archipelago.js";
import { NPuzzleSlotData } from "../types/NPuzzleSlotData";
import APIcon from "../images/APIcon.png";

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
    const [checkedLocations, setCheckedLocations] = useState<number[]>(client.room.checkedLocations);
    const [deathLinkMessage, setDeathLinkMessage] = useState("");
    const goalPuzzle = Array.from({ length: dimSize }, (_, i) =>
        Array.from({ length: dimSize }, (_, j) => {
            const value = i * dimSize + j + 1;
            return value === size ? 0 : value;
        })
    );

    useEffect(() => {
        const handleItemsReceived = () => {
            const allItems = client.items.received.map(item => item.name);
            const items = allItems.filter(item => /^\d+$/.test(item));
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
            }, 5000);
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
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [puzzle, dimSize]);

    function checkPuzzle(board: number[][] = puzzle) {
        let totalSolved = 0;
        for (let i = 0; i < dimSize; i++) {
            for (let j = 0; j < dimSize; j++) {
                if (revealed.includes(board[i][j].toString()) && board[i][j] === goalPuzzle[i][j] && !checkedLocations.includes(board[i][j])) {
                    client.check(board[i][j]);
                    totalSolved++;
                }
            }
        }
        client.check(1000 + totalSolved);
        if (totalSolved === size - 1) {
            client.goal();
        }
    }

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
        } else if (slotData.deathLink) {
            client.deathLink.sendDeathLink(client.name, `${client.name} made an invalid move.`);
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
        if (revealed.includes(value.toString())) {
            return value;
        }
        return <img src={APIcon} alt="Unrevealed Cell" className="PuzzleCellImage" />;
    }

    function resetPuzzle() {
        setPuzzle(slotData.puzzle.map(row => [...row]));
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
            <Button className="ButtonAP" onClick={() => resetPuzzle()}>
                RESET PUZZLE
            </Button>
        </div>
    );
}