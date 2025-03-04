import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
    const inputRef = useRef();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userMessage = inputRef.current.value.trim();
        if (!userMessage) return;
        
        // Clear input immediately after submission
        inputRef.current.value = "";

        const newHistory = [...chatHistory, { role: "user", text: userMessage }];
        
        setChatHistory(newHistory);
        
        console.log("Updated chatHistory with user message:", newHistory);  

        setTimeout(() => {
            const thinkingMessage = { role: "model", text: "Thinking..." };
            setChatHistory((prevHistory) => [...prevHistory, thinkingMessage]);
            console.log("Added 'Thinking...' to chatHistory");
            generateBotResponse(newHistory); 
        }, 600);
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
