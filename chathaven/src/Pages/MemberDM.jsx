import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import { supabase } from "../utils/supabaseClient";
import Picker from '@emoji-mart/react'; // use for emoji support
import emojiData from '@emoji-mart/data'; // use for emoji support


export const MemberDM = () => {
  const { username } = useParams(); // Friend's username from the URL
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [friendProfile, setFriendProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFriendProfile = async () => {
      const { data: friendData } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      
      setFriendProfile(friendData);
    };

    if (username) {
      fetchFriendProfile();
    }
  }, [username]);

  useEffect(() => {
    if (!currentUser || !friendProfile) return;

    const fetchMessages = async () => {
      const { data: dms } = await supabase
        .from("dms")
        .select("*")
        .or(
          `and(user_id.eq.${currentUser.id},recipient_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},recipient_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });

      setMessages(dms || []);
    };

    fetchMessages();

    const subscription = supabase
      .channel("dms")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dms"
        },
        (payload) => {
          const newMessage = payload.new;
          if (
            (newMessage.user_id === currentUser.id &&
              newMessage.recipient_id === friendProfile.id) ||
            (newMessage.user_id === friendProfile.id &&
              newMessage.recipient_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser, friendProfile]);

  // Handle sending message: adds message to local state
  const handleSend = async () => {
    if (input.trim() && currentUser && friendProfile) {
      const newMessage = {
        message: input,
        user_id: currentUser.id,
        recipient_id: friendProfile.id,
      };

      const { error } = await supabase.from("dms").insert(newMessage);
      if (error) {
        console.error("Error sending message:", error);
      }
      setInput("");
    } 
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

  // Format timestamp (customize format as desired)
  const formatTimestamp = (timestamp) => {
    const dateObj = new Date(timestamp);
    return dateObj.toLocaleString();
  };

  // Emoji picker configuration
  const emojiButtonRef = useRef(null);
  const [showEmojis, setShowEmojis] = useState(false);
// Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        setShowEmojis(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [emojiWindowPosition, setemojiWindowPosition] = useState({ x: 0, y: 0 });
  // Capture the mouse position when clicking the button
  const handleEmojiButtonClick = (event) => {
    setShowEmojis((prev) => !prev);

    setemojiWindowPosition({ x: event.clientX, y: event.clientY }); // Store cursor position
  };

  // end of emoji picker configuration

  return (
    <div className="main-container">
      {/* DM Header */}
      <div className="dm-header">
        <span className="username">{username}</span>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.user_id === currentUser?.id ? "outgoing" : "incoming"}`}
          >
            <div className="message-bundle">
              <div className="message-timestamp">
                {formatTimestamp(msg.created_at)}
              </div>
              <div className="message__outer">
                <div className="message__bubble">
                  <div className="sender-name">
                    {msg.user_id === currentUser?.id
                      ? "You"
                      : username || "Unknown"}
                    :
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      {showEmojis && (
          <div ref={emojiButtonRef}
               style={{
                 // position: "fixed",
                 top: `${emojiWindowPosition.y}px`,
                 left: `${emojiWindowPosition.x}px`,
                 zIndex: 1000,
               }}>
            <Picker
                data={emojiData} // load emoji data
                navPosition={"bottom"}
                onEmojiSelect={(emoji) => setInput(input + emoji.native)} // add emoji to input
            />
          </div>
      )}
      <div className="chat-input-container">
        <button
          type={"button"}
          className=""
          onClick={() => setShowEmojis(!showEmojis) && handleEmojiButtonClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="white"
            className="react-input-emoji--button--icon"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10"></path>
            <path d="M8 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 8 7M16 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 16 7M15.232 15c-.693 1.195-1.87 2-3.349 2-1.477 0-2.655-.805-3.347-2H15m3-2H6a6 6 0 1 0 12 0"></path>
          </svg>
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write message"
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default MemberDM;
