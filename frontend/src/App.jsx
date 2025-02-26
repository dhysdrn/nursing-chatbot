import { useState } from "react";
import ChatForm from "./components/ChatForm";
import GreenRiverIcon from "./components/GreenRiverIcon";
import ChatMessage from "./components/ChatMessage";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);

  const generateBotResponse = (history) => {
    console.log(history);
  }

  return (
    <div>
      <div className="container-left">
        {/* insert instructions here - TODO by 2/26 end of the day*/}
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
            <div className="message bot-message">
              <p className="message-text">
                Hey there! <br />Type in any 
                nursing questions and get a response! Your 
                chats won’t be saved when you leave the site. 
              </p>
            </div>

            {/* Loads messages */}
            {chatHistory.map((chat, index) => (
              <ChatMessage key={index} chat={chat} />
            ))}

          </div>

          {/* ChatBot Footer */}
          <div className="chat-footer">
            <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
          </div>
        </div>
      </div>
    </div>
  )
};

export default App;