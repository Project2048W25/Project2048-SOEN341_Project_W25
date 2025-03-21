import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import "./index.css";

export const MembersList = ({ channelId }) => {
  const [channelCreatorId, setChannelCreatorId] = useState(null);
  const [requests, setRequests] = useState([]); // pending requests
  const [accepted, setAccepted] = useState([]); // accepted members
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user || null);
    };
    getUser();
  }, []);

  // Fetch channel creator and membership info
  useEffect(() => {
    if (!channelId) return;

    // 1) Get the channel's creator_id
    const fetchChannelCreator = async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("creator_id")
        .eq("id", channelId)
        .single();
      if (!error && data) {
        setChannelCreatorId(data.creator_id);
      }
    };

    // 2) Fetch all channel_members for the channel
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from("channel_members")
        .select("id, user_id, status, profiles!inner(username, status)")
        .eq("channel_id", channelId);     

        if (error) {
        console.error("Error fetching channel_members:", error);
        return;
      }
      console.log("Fetched members:", data);
      setAccepted(data);

      const pendingList = data.filter((m) => m.status === "pending");
      const acceptedList = data.filter((m) => m.status === "accepted");
      setRequests(pendingList);
      setAccepted(acceptedList);
    };

    fetchChannelCreator();
    fetchMembers();

    const membershipSub = supabase
      .channel("channel_members_list")
      .on("postgres_changes", { event: "*", schema: "public", table: "channel_members" }, (payload) => {
        if (
          (payload.new && payload.new.channel_id === channelId) ||
          (payload.old && payload.old.channel_id === channelId)
        ) {
          fetchMembers();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(membershipSub);
    };
  }, [channelId]);

  // Accept a pending request
  const acceptRequest = async (memberId) => {
    try {
      const { error } = await supabase
        .from("channel_members")
        .update({ status: "accepted" })
        .eq("id", memberId);
      if (error) {
        console.error("Error accepting request:", error);
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  // Decline a pending request
  const declineRequest = async (memberId) => {
    try {
      const { error } = await supabase
        .from("channel_members")
        .delete()
        .eq("id", memberId);
      if (error) {
        console.error("Error declining request:", error);
      }
    } catch (err) {
      console.error("Error declining request:", err);
    }
  };

  const isCreator = currentUser && channelCreatorId && currentUser.id === channelCreatorId;

  //Fetch the status
  useEffect(() => {
    if (!currentUser) return;
  
    const updateStatus = async (status) => {
      await supabase
        .from("profiles")
        .update({ status })
        .eq("id", currentUser.id);

      if (status === "offline") {
        await supabase
          .from("profiles")
          .update({ last_seen: new Date().toISOString() })
          .eq("id", currentUser.id);
      }
    };
  
    // Set to "online" when active
    const handleActivity = () => {
      updateStatus("online");
      
      // Reset the timer to detect inactivity again
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => updateStatus("away"), 60000); // 1 min inactivity = away
    };
  
    // Set to "offline" when closing the page
    const handleBeforeUnload = async () => {
      await updateStatus("offline");
    };
  
    let inactivityTimer = setTimeout(() => updateStatus("away"), 60000); // 1 min of inactivity
  
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUser]);
  
  const getStatusClass = (status) => {
    switch (status) {
      case "online":
        return "status-online";
      case "away":
        return "status-away";
      case "offline":
      default:
        return "status-offline";
    }
  };

  // Get the live status updates of the members
  const updateProfileStatus = (prev, payload) =>{
    return prev.map((m) =>
      m.user_id === payload.new.id
        ? {...m, profiles: {...m.profiles, status: payload.new.status}}
        : m
    );
  };

  useEffect(() => {
    const statusSubscription = supabase
      .channel("profiles_status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
        setAccepted((prev) => updateProfileStatus(prev, payload)); // Use helper function
        }
      );

      return () => statusSubscription.unsubscribe();
  },[]);
    
  

  return (
    <div className="members-list">
      {isCreator && requests.length > 0 && (
        <div className="requests-section">
          <h4>Requests</h4>
          <ul>
            {requests.map((r) => (
              <li key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{r.profiles?.username || "Unknown"}</span>
                <div>
                  <button onClick={() => acceptRequest(r.id)}>✅</button>
                  <button onClick={() => declineRequest(r.id)}>❌</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h4>Members</h4>
      <ul>
        {accepted.map((m) => {
          const isChannelCreator = m.user_id === channelCreatorId;
          const userStatus = m.profiles?.status || "offline"; 
          return (
            <li key={m.id} className="member-item">
              <span className="username">
                {m.profiles?.username || "Unknown"} {isChannelCreator && "👑"}
              </span>
              <div className="user-status">
                <span className={`status-indicator ${getStatusClass(userStatus)}`}></span>
                <span className="status-text">
                  {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                </span>
              </div>
            </li>

          );
        })}
      </ul>
    </div>
  );
};

export default MembersList;
