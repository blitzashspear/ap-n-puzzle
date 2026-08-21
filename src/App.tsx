import React from "react";
import "./App.css";
import { ConnectToAP } from "./components/ConnectToAP";
import { APTextClient } from "./components/APTextClient";
import { NPuzzle } from "./components/NPuzzle";

function App(): JSX.Element {
    return (
        <div className="App">
            <h1>n-Puzzle Archipelago</h1>
            <ConnectToAP />
            <APTextClient />
            <NPuzzle />
        </div>
    );
}

export default App;
// TODO (Client)
// Make text client a scrollable container.
// Make pressing connect again stop the first attempt at connecting.
// Make Connected text disappear when client is not connected anymore.
// Add puzzle. Mouse clicks, and arrow keys should both work.
// Make starting puzzle reflect ap gen.
// Make puzzle send checks.
// Make puzzle save state in between sessions (datastorage?)
// Get rid of memory leaks from useState.
// Change logo of site (shuffled ap logo 8puzzle).