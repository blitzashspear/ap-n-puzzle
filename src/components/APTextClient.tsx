import React, { useEffect, useState } from "react";
import { InputGroup, Button, Form } from "react-bootstrap";
import { client } from "./ConnectToAP";

export function APTextClient(): JSX.Element {
    const [text, setText] = useState("");
    const [errText, setErrText] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        client.messages.on("message", (content) => {
            console.log(content);
            setMessages(prevMessages => [...prevMessages, content]);
            setErrText("");
        });
    }, []);

    async function sendMessage() {
        if (text !== "") {
            await client.messages.say(text)
                .catch((error) => {
                    setErrText("Not connected to Archipelago.");
                    console.error(error);
                });
            setText("");
        }
    }

    return (
        <div className="APTextClient">
            <div className="APTextClientText">
                {errText}
                {messages.map(message => {
                    {
                        return <div className="APMessage">
                            {message}
                        </div>;
                    }
                })}
            </div>
            <div className="APTextClientInteractives">
                <InputGroup className="mb-1">
                    <Form.Control
                        placeholder=""
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                    />
                </InputGroup>
                <Button className="ButtonAP" onClick={sendMessage}>
                    SEND
                </Button>
            </div>
        </div>
    );
}