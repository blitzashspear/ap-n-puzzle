import React from "react";
import { Button } from "react-bootstrap";

export function DownloadAPWorld(): JSX.Element {
    /**
     * why i made the decision to make a whole ass component file to render 1 fucking button is beyond me
     * to compensate i was gonna have chatgpt write me the most heinous docstring ever conceived to man
     * instead it hung on this
     * ╔══════════════════════════════════════════════════════════════════════════════
     * i thought that was infinitely funnier than whatever it was going to generate.
     */
    const downloadUrl = "https://github.com/blitzashspear/ap-n-puzzle/releases";

    return (
        <div className="DownloadAPWorld">
            <Button
                className="ButtonAP"
                onClick={() => window.open(downloadUrl, "_blank", "noopener,noreferrer")}
            >
                DOWNLOAD APWORLD
            </Button>
        </div>
    );
}
