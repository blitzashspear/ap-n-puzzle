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
// Add puzzle. Mouse clicks, and arrow keys should both work.
// Make starting puzzle reflect ap gen.
// Block puzzle squares from view, AP logo will be used to block the number.
// Make puzzle send checks.
// Make puzzle save state in between sessions (datastorage?)
// Make puzzle send goal packet to AP when complete.
// Get rid of memory leaks from useState.
// Change logo of site (shuffled ap logo 8puzzle).
// Add button to reset puzzle.