import React, { useState } from "react";
import axios from "axios";
import "../App.css";

function App() {
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([]);

    const handleSendMessage = async () => {
        if (!question.trim()) return;

        const userMessage = { sender: "user", text: question };
        setChatHistory((prev) => [...prev, userMessage]);

        try {
            const response = await axios.post("http://localhost:5000/chat", { question });
            const botMessage = { sender: "bot", text: response.data.answer };

            setChatHistory((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            setChatHistory((prev) => [...prev, { sender: "bot", text: "Something went wrong. Please try again later." }]);
        }

        setQuestion("");
    };

    return (
        <div className="chat-container">
            <h1>GRC Nursing ChatBot</h1>
            <div className="chat-box">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask me about GRC Nursing..."
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
}

export default App;
