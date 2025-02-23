const App = () => {
  return (
    <div className="container">
      <div className="chatbot-popup">
        {/* ChatBot Header */}
        <div className="chat-header">
          <div className="header-info">
            <h2 className="logo-text">ChatBot</h2>
          </div>
        </div>

        {/* ChatBot Body */}
        <div className="chat-body">
          <div className="message bot-message">
            <p className="message-text">
              Hey there! <br />Type in any 
              nursing questions and get a response! Your 
              chats won’t be saved when you leave the site. 
            </p>
          </div>
          <div className="message user-message">
            <p className="message-text">
            Lorem ipsum odor amet, consectetuer adipiscing elit. 
            Dictum ad commodo nec lacinia lectus porttitor mauris. 
            </p>
          </div>
        </div>

        {/* ChatBot Footer */}
        <div className="chat-footer">
          <form action="#" className="chat-form">
            <input type="text" placeholder="Type message here.."
            className="message-input" required />
            <button className="material-symbols-outlined">
            keyboard_arrow_right
            </button>          
          </form>
        </div>
      </div>
    </div>
  )
};

export default App;