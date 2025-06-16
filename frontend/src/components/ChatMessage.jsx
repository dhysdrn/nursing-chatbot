/**
 * @description
 * Renders a chat message with styling based on the sender's role.
 *
 * @param {Object} props
 * @param {{ role: string, content: string }} props.chat - The chat message object.
 * @returns {JSX.Element} The styled chat message component.
 */

const ChatMessage = ({ chat }) => {
    return (
        <div className={`message ${chat.role === "system" ? 'bot' : 'user'}-message`}>
             <p className="message-content" dangerouslySetInnerHTML={{ __html: chat.content }}/>
        </div>
    )
}

export default ChatMessage;
