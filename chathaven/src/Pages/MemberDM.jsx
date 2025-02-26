import { useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";

export const MemberDM = () => {
  const { username } = useParams(); // Get the selected friend's username
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isOutgoing: true }]);
      setInput("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="main-container">
      {/* Header */}
      <div className="dm-header">
        <div className="avatar"></div>
        <span className="username">{username}</span>
      </div>
      
      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isOutgoing ? "outgoing" : "incoming"}`}>
            <div className="message__outer">
            {!msg.isOutgoing && <div className="message__avatar"></div>}
              {/* <div className="message__avatar"></div> */}
              <div className="message__inner">
                <div className="message__bubble">{msg.text}</div>
                <div className="message__actions"></div>
                <div className="message__spacer"></div>
              </div>
              {/* {msg.isOutgoing && <div className="message__status"></div>} */}
            </div>
          </div>
        ))}
      </div>
      
      {/* Message Input */}
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} //Detects if the user presses the Enter key
          placeholder="Write message"
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">Send</button>
      </div>
    </div>
  );
};

export default MemberDM;
