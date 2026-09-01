import React, { useState } from "react";
import { Client } from "archipelago.js";
import "./App.css";
import { ConnectToAP } from "./components/ConnectToAP";
import { APTextClient } from "./components/APTextClient";
import { NPuzzle } from "./components/NPuzzle";
import { NPuzzleSlotData } from "./types/NPuzzleSlotData";


function App(): JSX.Element {
    const [client] = useState<Client>(() => new Client());
    const [slotData, setSlotData] = useState<NPuzzleSlotData | null>(null);

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
// Make text client a scrollable container.
// Make pressing connect again stop the first attempt at connecting.
// Change states when client gets disconnected.
// Add disconnect button.
// Implement puzzle arrow keys.
// Use AP logo will be used to block the number instead of ?s.
// Make puzzle save state in between sessions (datastorage?)
// Get rid of memory leaks from useState.
// Change logo of site (shuffled ap logo 8puzzle).
// Add my funny deathlink idea.