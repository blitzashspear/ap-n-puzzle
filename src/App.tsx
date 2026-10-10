import React, { useEffect, useState } from "react";
import { Client } from "archipelago.js";
import "./App.css";
import { ConnectToAP } from "./components/ConnectToAP";
import { DownloadAPWorld } from "./components/DownloadAPWorld";
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

    // Making everything into different components like my uni project was a big fat fucking mistake but im way too far in god if you are watching please forgive me then reformat everything pretty please i will give you a cookie.
    return (
        <div className="App">
            <h1>n-Puzzle Archipelago</h1>
            <ConnectToAP client={client} setSlotData={setSlotData} />
            <APTextClient client={client} />
            <NPuzzle client={client} slotData={slotData} />
            {!client.authenticated && <DownloadAPWorld />}
            {isDevelopment && !client.authenticated && <DemoPuzzle />}
            {isDevelopment && !client.authenticated && <DemoText />}
        </div>
    );
}

export default App;
// TODO (Client)
// Goal screen.
// Square bg change when on correct spot.
// Sounds