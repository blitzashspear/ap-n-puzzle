import React, { useEffect, useState } from "react";
import { Client } from "archipelago.js";
import "./App.css";
import { ConnectToAP } from "./components/ConnectToAP";
import { APTextClient } from "./components/APTextClient";
import { NPuzzle } from "./components/NPuzzle";
import { NPuzzleSlotData } from "./types/NPuzzleSlotData";
import { DemoPuzzle } from "./components/DemoPuzzle";
import { DemoText } from "./components/DemoText";


function App(): JSX.Element {
    const [client, setClient] = useState<Client>(new Client());
    const [slotData, setSlotData] = useState<NPuzzleSlotData | null>(null);
    const isDevelopment = process.env.NODE_ENV === "development";

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
            {isDevelopment && !client.authenticated && <DemoPuzzle />}
            {isDevelopment && !client.authenticated && <DemoText />}
        </div>
    );
}

export default App;
// TODO (Client)
// Keep track of checked locations so I dont spam the server.
// Make puzzle save state in between sessions (datastorage?)
// Color items in chat.
// Goal screen.
// Square bg change when on correct spot.
// Sounds
// Actually implement deathlink.