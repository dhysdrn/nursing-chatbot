const ChatMessage = ({ chat }) => {
    return (
        <div className={`message ${chat.role === "model" ? 'bot' : 'user'}-message`}>
            <p className="message-text">{chat.text}</p>
        </div>
    )
}

export default ChatMessage;
