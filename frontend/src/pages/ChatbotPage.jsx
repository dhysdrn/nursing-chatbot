import { useEffect, useState, useRef } from "react";
import ChatForm from "../components/ChatForm";
import GreenRiverIcon from "../components/GreenRiverIcon";
import ChatMessage from "../components/ChatMessage";
import ThemeToggle from "../components/ThemeToggle";
import AdminButton from "../components/AdminButton";


/**
 * Main application component for the Advising Chatbot.
 * Handles user interactions and displays chat history.
 * @returns {JSX.Element} The rendered application component.
 */
const ChatbotPage = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const chatBodyRef = useRef();
  let fetchURL = import.meta.env.VITE_FETCH_URL;
  fetchURL = fetchURL + "/ask";

  /**
   * Sends the latest user message to the server and updates chat history with the bot's response.
   * @param {Array} history - The current chat history.
   */
  const generateBotResponse = async (history) => {
    const lastMessage = history[history.length - 1];
  
    try {
      const response = await fetch(fetchURL, {
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
      <div className="app-container">
        <ThemeToggle/>
        <AdminButton/>
        <div className="chat-container">
          {/* ChatBot Header */}
          <div className="header">
              <GreenRiverIcon />
          </div>
          {/* ChatBot Body */}
          <div ref={chatBodyRef} className="chat-body">
            <div className="message bot-message">
              <strong>Welcome to the Green River Nursing Advising Chatbot!</strong> 
              <br/>
              We are here to help with anything related to the <strong>nursing program</strong> and <strong>advising</strong>. Feel free to ask questions — we’ll do our best to get you the info you need!
              <ul>
                <li><strong>About the Nursing Program:</strong> Have questions about <em>admissions, courses, or requirements</em>? Just ask!</li>
                <li><strong>Advising:</strong> Need help with <em>course planning, schedules, or academic guidance</em>? We’ve got you covered.</li>
              </ul>
            </div>
          
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
      
      <footer className="footer">
        &copy; {new Date().getFullYear()} Green River College Nursing Program
      </footer>
    </div>
  );
};

export default ChatbotPage;
