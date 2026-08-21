import React from "react";
// import { client } from "./ConnectToAP";

// function generatePuzzle() {
//     return;
// }

export function NPuzzle(): JSX.Element {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            <div className="NPuzzle">
                <div className="NPuzzle-8"></div>
                <div className="NPuzzle-8"></div>
                <div className="NPuzzle-8"></div>
                <div className="NPuzzle-8"></div>
                <div className="NPuzzle-8"></div>
                <div className="NPuzzle-8"></div>
                <div className="NPuzzle-8"></div>
                <div className="NPuzzle-8"></div>
                <div className="NPuzzle-8"></div>
            </div>
        </div>
    );
}