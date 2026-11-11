import React, { useEffect, useRef, useState } from "react";
import { InputGroup, Button, Form } from "react-bootstrap";

// IF MY DEMO STUFF SHOWS UP IN PROD I WILL DIE
export function DemoText(): JSX.Element {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [hideMessages, setHideMessages] = useState(false);
    const messagesContainer = useRef<HTMLDivElement>(null);
    const shouldAutoScroll = useRef(true);

    useEffect(() => {
        const container = messagesContainer.current;
        if (container && shouldAutoScroll.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, hideMessages]);

    function sendMessage() {
        setMessages([...messages, text]);
        setText("");
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
