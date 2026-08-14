import React from "react";
import "./App.css";
import { ConnectToAP } from "./components/ConnectToAP";

function App(): JSX.Element {
    return (
        <div className="App">
            <h1>n-Puzzle Archipelago</h1>
            <ConnectToAP />
        </div>
    );
}

export default App;

// TODO (Client)
// 2. Make client show a text field on the right side.
// 3. Add puzzle. Mouse clicks, and arrow keys should both work.
// 4. Make starting puzzle reflects ap gen.
// 5. Make puzzle send checks.
// 6. Make puzzle save state in between sessions (datastorage?)
// 7. Get rid of memory leaks from useState.
// 8. Change logo of site.