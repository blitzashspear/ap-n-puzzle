import React, { useEffect, useState } from "react";
import { InputGroup, Button, Form } from "react-bootstrap";
import { Client } from "archipelago.js";

type APTextClientProps = {
    client: Client;
};

export function APTextClient({ client }: APTextClientProps): JSX.Element {
    if (!client.authenticated) {
        return <></>;
    }
    return <TextClient client={client} />;
}

function TextClient({ client }: APTextClientProps): JSX.Element {
    const [text, setText] = useState("");
    const [errText, setErrText] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [hideMessages, setHideMessages] = useState(false);

    useEffect(() => {
        const handleMessage = (content: string) => {
            setMessages(prevMessages => [...prevMessages, content]);
            setErrText("");
        };

        client.messages.on("message", handleMessage);

        return () => {
            client.messages.off("message", handleMessage);
        };
    }, [client]);

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
                {messages.map((message, index) => {
                    return <div key={index} className="APMessage">
                        {message}
                    </div>;
                })}
            </div>
            <div className="APTextClientInteractives">
                <InputGroup className="mb-1">
                    <Form.Control
                        placeholder=""
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                    />
                </InputGroup>
                <Button className="ButtonAP" onClick={sendMessage}>
                    SEND
                </Button>
                <Button className="ButtonAP" onClick={() => setHideMessages(!hideMessages)}>
                    {hideMessages ? "SHOW" : "HIDE"}
                </Button>
            </div>
        </div>
    );
}