const ChatMessage = ({ chat }) => {
    return (
        <div className={`message ${chat.role === "model" ? 'bot' : 'user'}-message`}>
             <p className="message-text" dangerouslySetInnerHTML={{ __html: chat.text }}/>
        </div>
    )
}

export default ChatMessage;
