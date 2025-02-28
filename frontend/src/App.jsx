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
      <h1>Welcome to the Chatbot!</h1>
      <br></br>
      <p>Please feel free to ask questions related to the <strong>nursing program</strong> and <strong>advising</strong>. Here are a few guidelines to help you get the best responses:</p>

      <ul>
        <li><strong>Ask about the nursing program</strong> – You can ask about admissions, course details, requirements, and more!</li>
        <li><strong>Ask about advising</strong> – If you need help with course planning, schedules, or general academic advice, just let us know.</li>
      </ul>
      <br></br>
        <h3>Important Reminders:</h3>
       
        <ul>
          <li>The chatbot is designed to help with nursing program information and advising only.</li>
          <li><strong>Please avoid asking unrelated questions.</strong> The chatbot may not respond to those or provide an accurate answer.</li>
          <li>If you’re unsure whether your question is relevant, try to keep it focused on academic or program-related topics.</li>
        </ul>
        <br></br>
        <h3>How to Use:</h3>
        <ul>
          <li>Simply type your question in the chatbox below.</li>
          <li>If you don’t get an answer or need more help, feel free to ask in a different way or contact an advisor directly!</li>
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