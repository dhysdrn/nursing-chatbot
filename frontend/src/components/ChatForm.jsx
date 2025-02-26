import { useRef } from "react";
const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
    const inputRef = useRef();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userMessage = inputRef.current.value.trim();
        if(!userMessage) return;
        inputRef.current.value = "";

        // update chat history with the user's message
        setChatHistory((history) => [...history, { role: "user", text: userMessage}]);
        
        // delay 600 ms before showing "Thinking..." and generating response
        setTimeout(() => {
            // add "Thinking..." placeholder
            setChatHistory((history) => [...history, { role: "model", text: "Thinking..."}]);

            // call function to generate bot's response
            generateBotResponse([...chatHistory, { role: "user", text: userMessage}]);
        }, 600);
    }

    return (
        <form action="#" className="chat-form" onSubmit={handleFormSubmit}>
            <input ref={inputRef} type="text" placeholder="Type message here.."
            className="message-input" required />
            <button className="material-symbols-outlined">
            keyboard_arrow_right
            </button>          
          </form>
        )
    }

export default ChatForm;