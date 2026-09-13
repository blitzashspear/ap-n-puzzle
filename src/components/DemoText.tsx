import React, { useEffect, useState } from "react";
import { InputGroup, Button, Form } from "react-bootstrap";

export function DemoText(): JSX.Element {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [hideMessages, setHideMessages] = useState(false);

    function sendMessage() {
        setMessages([...messages, text]);
        setText("");
    }

    return (
        <div className="APTextClient">
            <div className="APTextClientText" style={{ display: hideMessages ? "none" : "block" }}>
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