import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
    const inputRef = useRef();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userMessage = inputRef.current.value.trim();
        if (!userMessage) return;
        
        inputRef.current.value = "";

        const newHistory = [...chatHistory, { role: "user", text: userMessage }];
        
        setChatHistory(newHistory);
        console.log("Updated chatHistory with user message:", newHistory);  

        const thinkingMessage = { role: "model", text: "Thinking." };
        setChatHistory((prevHistory) => [...prevHistory, thinkingMessage]);
        console.log("Added 'Thinking.' to chatHistory");

       
        let dotCount = 1;
        const intervalId = setInterval(() => {
            dotCount = (dotCount % 3) + 1; 
            const newThinkingMessage = { role: "model", text: `Thinking${".".repeat(dotCount)}` };
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
