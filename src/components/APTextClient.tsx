import React, { useEffect, useState } from "react";
import { InputGroup, Button, Form } from "react-bootstrap";
import { Client, MessageNode } from "archipelago.js";

type APTextClientProps = {
    client: Client;
};

type ChatMessage = {
    nodes: MessageNode[];
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
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hideMessages, setHideMessages] = useState(false);

    useEffect(() => {
        const handleMessage = (_content: string, nodes: MessageNode[]) => {
            setMessages(prevMessages => [...prevMessages, { nodes }]);
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

    function getItemClassName(node: MessageNode): string {
        if (node.type !== "item") {
            return "";
        }
        if (node.item.progression && node.item.useful) {
            return "APItemUsefulProgression";
        }
        if (node.item.progression) {
            return "APItemProgression";
        }
        if (node.item.useful) {
            return "APItemUseful";
        }
        if (node.item.trap) {
            return "APItemTrap";
        }
        return "";
    }

    return (
        <div className="APTextClient">
            <div className="APTextClientText">
                {errText}
                {messages.map((message, index) => {
                    return <div key={index} className="APMessage">
                        {message.nodes.map((node, nodeIndex) => {
                            return <span key={nodeIndex} className={getItemClassName(node)}>
                                {node.text}
                            </span>;
                        })}
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