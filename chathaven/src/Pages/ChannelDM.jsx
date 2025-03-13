import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { createPortal } from "react-dom";
import "./index.css";

export const ChannelDM = () => {
  const { channelId } = useParams();

  const [channelName, setChannelName] = useState("Loading...");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [teamOwnerId, setTeamOwnerId] = useState(null);

  // State for Context Menu
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    message: null,
  });

  useEffect(() => {
    // Fetch user & role
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (profileData) {
          setRole(profileData.role);
        }
      }
    };

    // Fetch channel details (including team info)
    const fetchChannelDetails = async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("title, team_id, teams(owner_id)")
        .eq("id", channelId)
        .single();

      if (error || !data) {
        console.error("Error fetching channel info:", error);
        setChannelName("Unknown Channel");
      } else {
        setChannelName(data.title);
        if (data.teams) {
          setTeamOwnerId(data.teams.owner_id);
        }
      }
    };

    // Fetch messages joined with profiles
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, message, user_id, created_at, channel_id, profiles(username)")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true });
      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
    };

    fetchUserAndRole();
    fetchChannelDetails();
    fetchMessages();

    // Real-time subscription for messages INSERT and DELETE
    const messageSubscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.channel_id === channelId) {
            (async () => {
              const newMsg = payload.new;
              const { data: profileData, error } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", newMsg.user_id)
                .single();
              if (!error && profileData) {
                newMsg.profiles = { username: profileData.username };
              }
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            })();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          if (payload.old.channel_id === channelId) {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [channelId]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          message: input,
          channel_id: channelId,
          user_id: user.id,
        },
      ])
      .select();
    if (error) {
      console.error("Error sending message:", error);
    } else if (data && data.length > 0) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data[0].id)) return prev;
        return [...prev, data[0]];
      });
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Context Menu Component
  const ContextMenu = ({ x, y, message, onClose }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(message.message);
      onClose();
    };

    const handleDelete = () => {
      const confirmDelete = window.confirm("Delete this message?");
      if (confirmDelete) {
        supabase
          .from("messages")
          .delete()
          .eq("id", message.id)
          .then(({ error }) => {
            if (error) {
              console.error("Error deleting message:", error);
            } else {
              setMessages((prev) => prev.filter((m) => m.id !== message.id));
            }
          });
      }
      onClose();
    };

    return createPortal(
      <div
        onMouseLeave={onClose}
        style={{ position: "absolute", top: y, left: x }}
        className="flex flex-col w-[203px] p-1.5 bg-gray-800 rounded-lg shadow-lg"
      >
        <button
          onClick={handleCopy}
          className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md transition"
        >
          Copy message
        </button>
        {((role === "Admin") || (teamOwnerId === user?.id)) && (
          <button
            onClick={handleDelete}
            className="w-full flex items-center px-3 py-2 text-red-400 hover:bg-gray-700 rounded-md transition"
          >
            Delete message
          </button>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div className="main-container">
      <div className="dm-header">
        <span className="username">#{channelName}</span>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.user_id === user?.id ? "outgoing" : "incoming"}`}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ visible: true, x: e.clientX, y: e.clientY, message: msg });
            }}
          >
            <div className="message-bundle">
              <div className="message-timestamp">{new Date(msg.created_at).toLocaleString()}</div>
              <div className="message__outer">
                <div className="message__bubble">
                  <div className="sender-name">
                    {msg.user_id === user?.id ? "You" : msg.profiles?.username || "Unknown"}
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write message"
          className="chat-input"
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          onClose={() => setContextMenu({ ...contextMenu, visible: false, message: null })}
        />
      )}
    </div>
  );
};

export default ChannelDM;
