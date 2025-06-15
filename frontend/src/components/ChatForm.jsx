/**
 * @description
 * This component renders a form for user input in a chat interface. It handles
 * submission of user messages, updates the chat history state, and triggers
 * generation of bot responses with a "Thinking..." animation.
 * @version 1.0
 */
import { useRef } from "react";

/**
 * @description
 * ChatForm component for handling user input and updating chat history.
 * 
 * @param {Object} props - Component props.
 * @param {Array} props.chatHistory - The current chat history.
 * @param {Function} props.setChatHistory - Function to update chat history.
 * @param {Function} props.generateBotResponse - Function to generate a bot response.
 * @returns {JSX.Element} The ChatForm component.
 */
const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
    const inputRef = useRef();

    /**
     * Handles form submission by sending user input to chat history and triggering bot response.
     * Adds a "Thinking..." message with animated dots while waiting for the response.
     * 
     * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
     */
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userMessage = inputRef.current.value.trim();
        if (!userMessage) return;
        
        inputRef.current.value = "";

        const newHistory = [...chatHistory, { role: "user", content: userMessage }];
        
        setChatHistory(newHistory);
        console.log("Updated chatHistory with user message:", newHistory);  

        // Display "Thinking..." while waiting for a bot response
        const thinkingMessage = { role: "system", content: "Thinking." };
        setChatHistory((prevHistory) => [...prevHistory, thinkingMessage]);
        console.log("Added 'Thinking.' to chatHistory");

        let dotCount = 1;
        const intervalId = setInterval(() => {
            dotCount = (dotCount % 3) + 1; 
            const newThinkingMessage = { role: "system", content: `Thinking${".".repeat(dotCount)}` };
            setChatHistory((prevHistory) => [...prevHistory.slice(0, -1), newThinkingMessage]);
        }, 500); 
     
        setTimeout(() => {
            clearInterval(intervalId);
            generateBotResponse(newHistory); 
        }, 2000); 
    };

    return (
        <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
            <input 
                ref={inputRef} 
                type="text" 
                placeholder="Type message here..." 
                className="message-input" 
                required 
            />
            <button className="material-symbols-outlined">
                keyboard_arrow_right
            </button>          
        </form>
    );
}

export default ChatForm;
