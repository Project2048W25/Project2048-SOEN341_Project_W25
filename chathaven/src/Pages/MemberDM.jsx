import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./index.css";
import { supabase } from "../utils/supabaseClient";

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
      })
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
                  <strong>
                    {msg.user_id === currentUser?.id ? "You" : msg.profiles?.username || "Unknown"}:
                  </strong>{" "}
                  {msg.message}
                </div>
              </div>
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
          onKeyDown={handleKeyDown}
          placeholder="Write message"
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">Send</button>
      </div>
    </div>
  );
};

export default MemberDM;
