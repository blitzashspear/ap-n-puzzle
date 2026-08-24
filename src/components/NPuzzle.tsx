import React from "react";
// import React, { useEffect, useState } from "react";
// import { client } from "./ConnectToAP";

const gridSizes = {
    9: "repeat(3, 150px)",
    16: "repeat(4, 120px)",
    25: "repeat(5, 100px)",
    36: "repeat(6, 80px)"
};

export function NPuzzle(): JSX.Element {
    const size = 9;
    const puzzle = Array(size).fill(0);
    // const [revealed, setRevealed] = useState<string[]>([]);
    // useEffect(() => {
    //     const items = client.items.received.map(item => {
    //         return item.name;
    //     });
    //     setRevealed(items);
    // }, []);
    return (
        <div className="NPuzzleContainer">
            <div className="PuzzleUI" style={{ gridTemplateColumns: gridSizes[size], gridTemplateRows: gridSizes[size] }}>
                {puzzle.map((_, index) => {
                    return <div key={index} className={`Size-${size}`}></div>;
                })}
            </div>
        </div>
    );
}