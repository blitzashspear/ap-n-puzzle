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
    const [isConnected, setIsConnected] = useState(false);
    const [showAPInfo, setShowAPInfo] = useState(true);

    async function connectToAP(host: string, port: string, player: string, password: string) {
        if (host === "") {
            host = "archipelago.gg";
        }
        if (port === "") {
            port = "38281";
        }
        if (player === "") {
            player = "Player1";
        }
        try {
            const newSlotData = await client.login<NPuzzleSlotData>(host + ":" + port, player, "n-Puzzle", { password });
            setSlotData(newSlotData);
            console.log("Connected with Slot Data:", newSlotData);
            setConnectMessage("");
            setIsConnected(true);
            client.check(999); // Starting Number
        } catch (error) {
            setSlotData(null);
            setConnectMessage("Failed to connect to Archipelago.");
            console.error(error);
            setIsConnected(false);
        }
    }

    function ConnectButton(): JSX.Element {
        if (isConnected) {
            if (showAPInfo) {
                return (
                    <Button className="ButtonAP" onClick={() => {
                        setShowAPInfo(!showAPInfo);
                    }}>
                        HIDE AP INFO
                    </Button>
                );
            } else {
                return (
                    <Button className="ButtonAP" onClick={() => {
                        setShowAPInfo(!showAPInfo);
                    }}>
                        SHOW AP INFO
                    </Button>
                );
            }
        }
        return (
            <Button className="ButtonAP" onClick={() => {
                connectToAP(host, port, player, password);
            }}>
                CONNECT TO ARCHIPELAGO
            </Button>
        );
    }

    return (
        <div className="ConnectToAP">
            <div style={{ display: showAPInfo ? "block" : "none" }}>
                <InputGroup className="mb-1 InputAPConnect">
                    <InputGroup.Text>Host</InputGroup.Text>
                    <Form.Control
                        placeholder="archipelago.gg"
                        aria-label="Host"
                        aria-describedby="host"
                        value={host}
                        style={{ width: "50%" }}
                        onChange={(e) => setHost(e.target.value)}
                    />
                    <Form.Control
                        placeholder="38281"
                        aria-label="Port"
                        aria-describedby="port"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                    />
                </InputGroup>
                <InputGroup className="mb-1 InputAPConnect">
                    <InputGroup.Text>Player</InputGroup.Text>
                    <Form.Control
                        placeholder="Player1"
                        aria-label="Player"
                        aria-describedby="player"
                        value={player}
                        onChange={(e) => setPlayer(e.target.value)}
                    />
                </InputGroup>
                <InputGroup className="mb-1 InputAPConnect">
                    <InputGroup.Text>Password</InputGroup.Text>
                    <Form.Control
                        placeholder=""
                        aria-label="Password"
                        aria-describedby="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </InputGroup>
            </div>
            <ConnectButton></ConnectButton>

            <div>
                {connectMessage}
            </div>
        </div>

    );
}
