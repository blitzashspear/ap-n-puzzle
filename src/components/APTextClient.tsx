import React, { useEffect, useRef, useState } from "react";
import { InputGroup, Button, Form } from "react-bootstrap";
import { Client, MessageNode } from "archipelago.js";

type APTextClientProps = {
    client: Client;
};

type ChatMessage = {
    nodes: MessageNode[];
};

const MAX_MESSAGES = 1000;
const MESSAGE_FLUSH_INTERVAL_MS = 100;

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
    const messagesContainer = useRef<HTMLDivElement>(null);
    const shouldAutoScroll = useRef(true);
    const pendingMessages = useRef<ChatMessage[]>([]);

    useEffect(() => {
        const container = messagesContainer.current;
        if (container && shouldAutoScroll.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        let flushTimeout: ReturnType<typeof setTimeout> | undefined;

        const flushMessages = () => {
            flushTimeout = undefined;
            const newMessages = pendingMessages.current;
            pendingMessages.current = [];

            if (newMessages.length > 0) {
                setMessages(prevMessages =>
                    [...prevMessages, ...newMessages.slice(-MAX_MESSAGES)].slice(-MAX_MESSAGES)
                );
                setErrText("");
            }
        };

        const handleMessage = (_content: string, nodes: MessageNode[]) => {
            pendingMessages.current.push({ nodes });
            if (flushTimeout === undefined) {
                flushTimeout = setTimeout(flushMessages, MESSAGE_FLUSH_INTERVAL_MS);
            }
        };

        client.messages.on("message", handleMessage);

        return () => {
            client.messages.off("message", handleMessage);
            if (flushTimeout !== undefined) {
                clearTimeout(flushTimeout);
            }
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

    // Literally only used to get the text color. App.css, line 93.
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
            <div
                ref={messagesContainer}
                className="APTextClientText"
                onScroll={(event) => {
                    const container = event.currentTarget;
                    shouldAutoScroll.current =
                        container.scrollHeight - container.scrollTop - container.clientHeight <= 1;
                }}
                style={{ display: hideMessages ? "none" : "block" }}
            >
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