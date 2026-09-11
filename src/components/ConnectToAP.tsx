import React, { useState } from "react";
import { InputGroup, Button, Form } from "react-bootstrap";
import { Client } from "archipelago.js";
import { NPuzzleSlotData } from "../types/NPuzzleSlotData";

type ConnectToAPProps = {
    client: Client;
    setSlotData: (slotData: NPuzzleSlotData | null) => void;
};

export function ConnectToAP({ client, setSlotData }: ConnectToAPProps): JSX.Element {
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [player, setPlayer] = useState("");
    const [password, setPassword] = useState("");
    const [connectMessage, setConnectMessage] = useState("");
    const [showAPInfo, setShowAPInfo] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);

    async function connectToSlot(host: string, port: string, player: string, password: string) {
        host = host || "archipelago.gg";
        port = port || "38281";
        player = player || "Player1";

        setIsConnecting(true);
        try {
            setSlotData(await client.login<NPuzzleSlotData>(host + ":" + port, player, "n-Puzzle", { password }));
            setConnectMessage("");
            client.check(999); // Starting Number
        } catch (error) {
            setSlotData(null);
            setConnectMessage("Failed to connect to Archipelago.");
            console.error(error);
        } finally {
            setIsConnecting(false);
        }
    }

    return (
        <div className="ConnectToAP">
            <div style={{ display: showAPInfo ? "block" : "none" }}>
                <InputGroup className="mb-1 InputAPConnect">
                    <InputGroup.Text>Host</InputGroup.Text>
                    <Form.Control
                        placeholder="archipelago.gg"
                        value={host}
                        style={{ width: "50%" }}
                        disabled={client.authenticated}
                        onChange={(e) => setHost(e.target.value)}
                    />
                    <Form.Control
                        placeholder="38281"
                        value={port}
                        maxLength={5}
                        disabled={client.authenticated}
                        onChange={(e) => setPort(e.target.value)}
                    />
                </InputGroup>
                <InputGroup className="mb-1 InputAPConnect">
                    <InputGroup.Text>Player</InputGroup.Text>
                    <Form.Control
                        placeholder="Player1"
                        value={player}
                        disabled={client.authenticated}
                        onChange={(e) => setPlayer(e.target.value)}
                    />
                </InputGroup>
                <InputGroup className="mb-1 InputAPConnect">
                    <InputGroup.Text>Password</InputGroup.Text>
                    <Form.Control
                        placeholder=""
                        type="password"
                        value={password}
                        disabled={client.authenticated}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </InputGroup>
            </div>
            {client.authenticated && (
                <Button
                    className="ButtonAP"
                    onClick={() => setShowAPInfo(visible => !visible)}
                >
                    {showAPInfo ? "HIDE AP INFO" : "SHOW AP INFO"}
                </Button>
            )}

            <Button
                className="ButtonAP"
                onClick={client.authenticated
                    ? () => client.socket.disconnect()
                    : () => connectToSlot(host, port, player, password)}
                disabled={isConnecting || client.authenticated}
            >
                {client.authenticated ? "DISCONNECT" : "CONNECT TO ARCHIPELAGO"}
            </Button>
            <div>
                {connectMessage}
            </div>
        </div>

    );
}
