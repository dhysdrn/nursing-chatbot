const ChatMessage = ({ chat }) => {
    return (
        <div className={`message ${chat.role === "system" ? 'bot' : 'user'}-message`}>
             <p className="message-content" dangerouslySetInnerHTML={{ __html: chat.content }}/>
        </div>
    )
}

export default ChatMessage;
