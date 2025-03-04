import { useState } from "react";
import ChatForm from "./components/ChatForm";
import GreenRiverIcon from "./components/GreenRiverIcon";
import ChatMessage from "./components/ChatMessage";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);

  const generateBotResponse = (history) => {
    console.log("Generating response for:", history);
    // Logic to generate the bot response
    const botResponse = "This is a bot's response"; 
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { role: "model", text: botResponse },
    ]);
  };

  return (
    <div>
      <div className="container-left">
        <h1>Welcome to the Advising Chatbot!</h1>
        <br />
        <p>
          We are here to help with anything related to the <strong>nursing
          program</strong> and <strong>advising</strong>. Feel free to ask
          anything, and we will do our best to provide the answers you need:
        </p>

        <ul>
          <li>
            <strong>About the nursing program</strong> – If you have questions
            about admissions, courses, or requirements, just ask!
          </li>
          <li>
            <strong>Advising</strong> – Need help with course planning, schedules, or academic advice? We’ve got you covered.
          </li>
        </ul>
      </div>
      <div className="container-right">
        <div className="chatbot-popup">
          {/* ChatBot Header */}
          <div className="chat-header">
            <div className="header-info">
              <GreenRiverIcon />
              <h2 className="logo-text">Advising Assistant</h2>
            </div>
            <button className="material-symbols-outlined">arrow_drop_down</button>
          </div>

          {/* ChatBot Body */}
          <div className="chat-body">
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}
          </div>

          {/* ChatBot Footer */}
          <div className="chat-footer">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
