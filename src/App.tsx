import React, { useEffect, useState } from "react";
import { Client } from "archipelago.js";
import "./App.css";
import { ConnectToAP } from "./components/ConnectToAP";
import { APTextClient } from "./components/APTextClient";
import { NPuzzle } from "./components/NPuzzle";
import { NPuzzleSlotData } from "./types/NPuzzleSlotData";


function App(): JSX.Element {
    const [client, setClient] = useState<Client>(new Client());
    const [slotData, setSlotData] = useState<NPuzzleSlotData | null>(null);

    useEffect(() => {
        const handleDisconnected = () => {
            setSlotData(null);
            setClient(new Client());
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
// Keep track of checked locations so I dont spam the server.
// Make puzzle save state in between sessions (datastorage?)
// Change logo of site (shuffled ap logo 8puzzle).
// Add my funny deathlink idea.
// Make the text yellow-green when the corresponding cell is checked. 