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

    async function connectToSlot(host: string, port: string, player: string, password: string) {
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
            setSlotData(await client.login<NPuzzleSlotData>(host + ":" + port, player, "n-Puzzle", { password }));
            setConnectMessage("");
            client.check(999); // Starting Number
        } catch (error) {
            setSlotData(null);
            setConnectMessage("Failed to connect to Archipelago.");
            console.error(error);
        }
    }

    function ShowHideButton(): JSX.Element {
        if (client.authenticated) {
            return (
                <Button className="ButtonAP" onClick={() => {
                    setShowAPInfo(!showAPInfo);
                }}>
                    {showAPInfo ? "HIDE AP INFO" : "SHOW AP INFO"}
                </Button>
            );
        }

        return <></>;
    }

    function ConnectDisconnectButton(): JSX.Element {
        if (client.authenticated) {
            return (
                <Button className="ButtonAP" onClick={() => {
                    client.socket.disconnect();
                }}>
                    DISCONNECT
                </Button>
            );
        }

        return (
            <Button className="ButtonAP" onClick={() => {
                connectToSlot(host, port, player, password);
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
                        value={password}
                        disabled={client.authenticated}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </InputGroup>
            </div>
            <ShowHideButton></ShowHideButton>
            <ConnectDisconnectButton></ConnectDisconnectButton>
            <div>
                {connectMessage}
            </div>
        </div>

    );
}
