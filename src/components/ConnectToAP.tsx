import React, { useState } from "react";
import { InputGroup, Button, Form } from "react-bootstrap";
import { Client } from "archipelago.js";

const client = new Client();
client.messages.on("message", (content) => {
    console.log(content);
});

export function ConnectToAP(): JSX.Element {
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
    const [player, setPlayer] = useState("");
    const [password, setPassword] = useState("");
    const [connectMessage, setConnectMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    function connectToAP(host: string, port: string, player: string, password: string) {
        if (host === "") {
            host = "archipelago.gg";
        }
        if (port === "") {
            port = "38281";
        }
        if (player === "") {
            player = "Player1";
        }
        //client.login(host + ":" + port, player, "n-Puzzle", { password: password })
        client.login(host + ":" + port, player, "", { password: password })
            .then(() => {
                setConnectMessage("Connected to Archipelago!");
                setIsConnected(true);
            })
            .catch(() => {
                setConnectMessage("Failed to connect to Archipelago:");
                setIsConnected(false);
            });
    }

    return (
        <div className="ConnectToAP">
            <InputGroup className="mb-1 InputAPConnect">
                <InputGroup.Text>Host</InputGroup.Text>
                <Form.Control
                    placeholder="archipelago.gg"
                    aria-label="Host"
                    aria-describedby="host"
                    value={host}
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
            <Button className="ButtonAP" onClick={() => {
                if (!isConnected) {
                    connectToAP(host, port, player, password);
                }
            }}>
                CONNECT TO ARCHIPELAGO
            </Button>
            <div>
                {connectMessage}
            </div>
        </div>

    );
}

export function APTextClient(): JSX.Element {
    const [text, setText] = useState("");

    async function sendMessage() {
        if (text !== "") {
            await client.messages.say(text)
                .catch((error) => {
                    console.error("Failed to send message. You're probably not connected to Archipelago.", error);
                });
            setText("");
        }
    }

    return (
        <div className="APTextClient">
            <InputGroup className="mb-1">
                <Form.Control
                    placeholder=""
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </InputGroup>
            <Button className="ButtonAP" onClick={sendMessage}>
                SEND
            </Button>
        </div>
    );
}