import React from "react";
import { Button } from "react-bootstrap";

export function DownloadAPWorld(): JSX.Element {
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
