import { useEffect, useState, useRef } from "react";
import ChatForm from "./components/ChatForm";
import GreenRiverIcon from "./components/GreenRiverIcon";
import ChatMessage from "./components/ChatMessage";

/**
 * Main application component for the Advising Chatbot.
 * Handles user interactions and displays chat history.
 * @returns {JSX.Element} The rendered application component.
 */
const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const chatBodyRef = useRef();

  /**
   * Sends the latest user message to the server and updates chat history with the bot's response.
   * @param {Array} history - The current chat history.
   */
  const generateBotResponse = async (history) => {
    const lastMessage = history[history.length - 1];
  
    try {
      const response = await fetch("http://localhost:5001/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: lastMessage.text }),
      });
  
      const data = await response.json();
  
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "model", text: data.response },
      ]);
    } catch (error) {
      console.error("Error fetching bot response:", error);
    }
  };  

  /**
   * Scrolls the chat window to the latest message whenever the chat history updates.
   */
  useEffect(() => {
    chatBodyRef.current.scrollTo({top: chatBodyRef.current.scrollHeight, behavior: "smooth"});
  }, [chatHistory]);

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
          <div ref={chatBodyRef} className="chat-body">
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
