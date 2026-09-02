import React, { useEffect, useState } from "react";
import { Client } from "archipelago.js";
import "./App.css";
import { ConnectToAP } from "./components/ConnectToAP";
import { APTextClient } from "./components/APTextClient";
import { NPuzzle } from "./components/NPuzzle";
import { NPuzzleSlotData } from "./types/NPuzzleSlotData";


function App(): JSX.Element {
    const [client] = useState<Client>(() => new Client());
    const [slotData, setSlotData] = useState<NPuzzleSlotData | null>(null);

    useEffect(() => {
        const handleDisconnected = () => {
            setSlotData(null);
        };

        client.socket.on("disconnected", handleDisconnected);

        return () => {
            client.socket.off("disconnected", handleDisconnected);
        };
    }, [client]);

    return (
        <div className="App">
            <h1>n-Puzzle Archipelago</h1>
            <ConnectToAP client={client} setSlotData={setSlotData} />
            <APTextClient client={client} />
            <NPuzzle client={client} slotData={slotData} />
        </div>
    );
}

export default App;
// TODO (Client)
// Make pressing connect again stop the first attempt at connecting.
// Implement puzzle arrow keys.
// Make sure the app realizes when its been disconnected not manually.
// AP logo will be used to block the number instead of ?s.
// Make puzzle save state in between sessions (datastorage?)
// Change logo of site (shuffled ap logo 8puzzle).
// Add my funny deathlink idea.
// When puzzle square is placed correctly and checked, make the background different.