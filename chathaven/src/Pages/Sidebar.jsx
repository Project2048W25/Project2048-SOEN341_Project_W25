import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "./index.css";

export const Sidebar = () => {
  // User & role state
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  // User presence status
  const [status, setStatus] = useState('online');

  // Teams & Channels
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // For channels display: all channels and membership info
  const [allChannels, setAllChannels] = useState([]);
  const [myMemberships, setMyMemberships] = useState([]);
  const [channelsForDisplay, setChannelsForDisplay] = useState([]);

  // Friends & friend requests
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  // Modals
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [showInviteTeamModal, setShowInviteTeamModal] = useState(false);
  const [teamToInvite, setTeamToInvite] = useState(null);
  const [inviteUsername, setInviteUsername] = useState("");

  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [usernameToAdd, setUsernameToAdd] = useState("");

  const [showJoinRequestModal, setShowJoinRequestModal] = useState(false);
  const [pendingChannel, setPendingChannel] = useState(null);

  // Add Friend Modal
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Determine if a channel is selected based on URL
  const currentChannelId = location.pathname.startsWith("/channel/")
    ? location.pathname.split("/channel/")[1]
    : null;

  // ----------------------------
  // Clear any persisted team selection on mount so default is "none"
  // ----------------------------
  useEffect(() => {
    localStorage.removeItem("selectedTeam");
    setSelectedTeam(null);
  }, []);

  // Persist selected team when user explicitly chooses one
  const handleTeamSelect = (teamData) => {
    setSelectedTeam(teamData);
    localStorage.setItem("selectedTeam", JSON.stringify(teamData));
  };

  // ----------------------------
  // Fetch basic user info, teams, friends, etc.
  // ----------------------------
  const fetchAllData = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error fetching user:", userError);
      return;
    }
    setUser(user);
    if (!user) return;

    const { data: profileData, error: profileFetchError } = await supabase
      .from("profiles")
      .select("username, role")
      .eq("id", user.id)
      .single();
    if (profileFetchError) {
      console.error("Error fetching profile:", profileFetchError);
      return;
    }
    if (profileData) {
      setRole(profileData.role);
      setUsername(profileData.username);
    }

    const { data: teamsData, error: teamsError } = await supabase
      .from("team_members")
      .select("team_id, teams(id, name, owner_id)")
      .eq("user_id", user.id);
    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
    } else {
      setTeams(teamsData || []);
    }

    const { data: acceptedFriends, error: friendsError } = await supabase
      .from("friends")
      .select("id, sender_id, receiver_id, sender:sender_id ( id, username, status), receiver:receiver_id ( id, username, status)") //added the status to sender & receiver
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });
    if (friendsError) {
      console.error("Error fetching friends:", friendsError);
    } else {
      setFriends(acceptedFriends || []);
    }

    const { data: pendingRequests, error: requestsError } = await supabase
      .from("friends")
      .select("id, sender_id, receiver_id, sender:sender_id ( id, username )")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (requestsError) {
      console.error("Error fetching friend requests:", requestsError);
    } else {
      setFriendRequests(pendingRequests || []);
    }
  };

  useEffect(() => {
    fetchAllData();
    const friendsSubscription = supabase
      .channel("friends_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "friends" }, fetchAllData)
      .subscribe();
    return () => {
      supabase.removeChannel(friendsSubscription);
    };
  }, []);

  // ----------------------------
  // Subscribe to team_members changes for real-time updates
  // ----------------------------
  useEffect(() => {
    if (!user) return;
    const teamsSubscription = supabase
      .channel("team_members_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "team_members" }, (payload) => {
        if (payload.new?.user_id === user.id || payload.old?.user_id === user.id) {
          fetchAllData();
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(teamsSubscription);
    };
  }, [user]);

  // -----------------------------
  // Detecting online, offline, and away status
  // -----------------------------
  useEffect(() => {
    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Turn on away status after 1 minute of inactivity
    let inactivityTimer;
    const handleUserActivity = () => {
      clearTimeout(inactivityTimer);
      setStatus('online');
      inactivityTimer = setTimeout(() => setStatus('away'), 60000); // 1 minute of inactivity
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      clearTimeout(inactivityTimer);
    };
  }, []);

  // UI for Status Indicator
  const getStatusClass = (status) => {
    switch (status) {
      case 'online':
        return 'status-online';
      case 'offline':
        return 'status-offline';
      case 'away':
        return 'status-away';
      default:
        return '';
    }
  };


  // ----------------------------
  // Fetch channels and memberships for the current team
  // ----------------------------
  useEffect(() => {
    if (!selectedTeam || !user) {
      setAllChannels([]);
      setMyMemberships([]);
      setChannelsForDisplay([]);
      return;
    }

    const fetchChannelsAndMemberships = async () => {
      const { data: teamChannels, error: chanError } = await supabase
        .from("channels")
        .select("*")
        .eq("team_id", selectedTeam.id);
      if (chanError) {
        console.error("Error fetching channels:", chanError);
        setAllChannels([]);
      } else {
        setAllChannels(teamChannels || []);
      }

      const { data: memberships, error: memError } = await supabase
        .from("channel_members")
        .select("id, channel_id, status")
        .eq("user_id", user.id);
      if (memError) {
        console.error("Error fetching channel_members:", memError);
        setMyMemberships([]);
      } else {
        setMyMemberships(memberships || []);
      }
    };

    fetchChannelsAndMemberships();

    const channelsSub = supabase
      .channel("channels_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "channels" }, fetchChannelsAndMemberships)
      .subscribe();

    const membershipSub = supabase
      .channel("channel_members_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "channel_members" }, fetchChannelsAndMemberships)
      .subscribe();

    return () => {
      supabase.removeChannel(channelsSub);
      supabase.removeChannel(membershipSub);
    };
  }, [selectedTeam, user]);

  // Combine channels with membership info
  useEffect(() => {
    if (!allChannels.length) {
      setChannelsForDisplay([]);
      return;
    }
    const combined = allChannels.map((ch) => {
      const membership = myMemberships.find((m) => m.channel_id === ch.id);
      return {
        ...ch,
        membershipStatus: membership ? membership.status : "none",
      };
    });
    setChannelsForDisplay(combined);
  }, [allChannels, myMemberships]);

  // ----------------------------
  // Request to join channel
  // ----------------------------
  const requestToJoinChannel = async (channel) => {
    try {
      const { error } = await supabase
        .from("channel_members")
        .insert([{ channel_id: channel.id, user_id: user.id, status: "pending" }]);
      if (error) {
        alert("Error requesting to join channel: " + error.message);
      } else {
        alert(`Join request sent for channel: ${channel.title}`);
      }
    } catch (err) {
      console.error("Error requesting to join channel:", err);
    }
  };

  // ----------------------------
  // Channel click handler
  // ----------------------------
  const handleChannelClick = (channel) => {
    if (channel.membershipStatus === "accepted") {
      navigate(`/channel/${channel.id}`);
    } else {
      setPendingChannel(channel);
      setShowJoinRequestModal(true);
    }
  };

  // ----------------------------
  // Create Team
  // ----------------------------
  const createTeam = async () => {
    if (!newTeamName) return;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user for createTeam:", userError);
        return;
      }
      const { data, error } = await supabase
        .from("teams")
        .insert([{ name: newTeamName, owner_id: user.id }])
        .select();
      if (error) {
        console.error("Error creating team:", error);
        return;
      }
      if (data && data.length > 0) {
        const newTeam = data[0];
        await supabase.from("team_members").insert([{ team_id: newTeam.id, user_id: user.id, invited_by: user.id }]);
        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .insert([{ title: "all-general", team_id: newTeam.id, creator_id: user.id }])
          .select();
        if (channelError) {
          console.error("Error creating default channel:", channelError);
        } else if (channelData && channelData.length > 0) {
          await supabase.from("channel_members").insert([{ channel_id: channelData[0].id, user_id: user.id, status: "accepted" }]);
        }
      }
      setNewTeamName("");
      setShowTeamModal(false);
      fetchAllData();
    } catch (err) {
      console.error("Error in createTeam:", err);
    }
  };

  // ----------------------------
  // Create Channel (normal addition: status accepted)
  // ----------------------------
  const createChannel = async () => {
    if (!selectedTeam || !newChannelName) return;
    try {
      const { data: channelData, error: channelError } = await supabase
        .from("channels")
        .insert([{ title: newChannelName, team_id: selectedTeam.id, creator_id: user.id }])
        .select();
      if (channelError) {
        console.error("Error creating channel:", channelError);
      } else if (channelData && channelData.length > 0) {
        const channelId = channelData[0].id;
        await supabase.from("channel_members").insert([{ channel_id: channelId, user_id: user.id, status: "accepted" }]);
        if (selectedTeam.owner_id && selectedTeam.owner_id !== user.id) {
          await supabase.from("channel_members").insert([{ channel_id: channelId, user_id: selectedTeam.owner_id, status: "accepted" }]);
        }
        setNewChannelName("");
        setShowChannelModal(false);
      }
    } catch (err) {
      console.error("Error in createChannel:", err);
    }
  };

  // ----------------------------
  // Invite User to Team (and add them to default channel "all-general")
  // ----------------------------
  const openInviteTeamModal = (team) => {
    setTeamToInvite(team);
    setInviteUsername("");
    setShowInviteTeamModal(true);
  };

  const inviteUserToTeam = async () => {
    if (!teamToInvite || !inviteUsername) return;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user for inviteUserToTeam:", userError);
        return;
      }
      const { data: profileData, error: getProfileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", inviteUsername)
        .single();
      if (getProfileError) {
        alert("Error finding user: " + getProfileError.message);
        return;
      }
      if (!profileData) {
        alert("User not found.");
        return;
      }
      const userId = profileData.id;
      const { error: insertError } = await supabase
        .from("team_members")
        .insert([{ team_id: teamToInvite.id, user_id: userId, invited_by: user.id }]);
      if (insertError) {
        alert("Error inviting user: " + insertError.message);
        return;
      }
      const { data: defaultChannel, error: defaultChannelError } = await supabase
        .from("channels")
        .select("*")
        .eq("team_id", teamToInvite.id)
        .eq("title", "all-general")
        .single();
      if (defaultChannelError) {
        console.error("Error fetching default channel:", defaultChannelError);
      } else if (defaultChannel) {
        await supabase.from("channel_members").insert([{ channel_id: defaultChannel.id, user_id: userId, status: "accepted" }]);
      }
      alert("User invited to the team!");
      setShowInviteTeamModal(false);
      setInviteUsername("");
      setTeamToInvite(null);
      fetchAllData();
    } catch (err) {
      console.error("Error inviting user to team:", err);
    }
  };

  // ----------------------------
  // Add User to Channel (normal addition: status accepted)
  // ----------------------------
  const openAddUserModal = (channel) => {
    setSelectedChannel(channel);
    setUsernameToAdd("");
    setShowAddUserModal(true);
  };

  const addUserToChannel = async () => {
    if (!usernameToAdd || !selectedChannel || !selectedTeam) return;
    try {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", usernameToAdd)
        .single();
      if (userError) {
        alert("Error fetching user: " + userError.message);
        return;
      }
      if (!userData) {
        alert("No user found with that username");
        return;
      }
      const userId = userData.id;
      const { data: membershipData, error: membershipError } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", selectedTeam.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (membershipError) {
        alert("Error checking membership: " + membershipError.message);
        return;
      }
      if (!membershipData) {
        alert("That user is not in this team. Invite them first.");
        return;
      }
      const { error: insertError } = await supabase
        .from("channel_members")
        .insert([{ channel_id: selectedChannel.id, user_id: userId, status: "accepted" }]);
      if (insertError) {
        alert("Error adding user to channel: " + insertError.message);
        return;
      }
      alert("User added to channel!");
      setShowAddUserModal(false);
      setUsernameToAdd("");
      setSelectedChannel(null);
      setTimeout(() => {
        setAllChannels((prev) => [...prev]);
      }, 300);
    } catch (err) {
      console.error("Error adding user to channel:", err);
    }
  };

  // ----------------------------
  // Friend Request Functions
  // ----------------------------
  const sendFriendRequest = async () => {
    if (!friendUsername) {
      alert("Please enter a username.");
      return;
    }
    try {
      const { data: receiverData, error: receiverError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", friendUsername)
        .single();
      if (receiverError) {
        alert("Error finding user: " + receiverError.message);
        return;
      }
      if (!receiverData) {
        alert("User not found.");
        return;
      }
      const receiverId = receiverData.id;
      if (receiverId === user.id) {
        alert("You cannot add yourself as a friend.");
        return;
      }
      const { data: existingRequest, error: existingError } = await supabase
        .from("friends")
        .select("id, status")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("receiver_id", receiverId)
        .maybeSingle();
      if (existingError) {
        alert("Error checking existing friend request: " + existingError.message);
        return;
      }
      if (existingRequest) {
        if (existingRequest.status === "pending") {
          alert("Friend request already sent.");
          return;
        } else if (existingRequest.status === "accepted") {
          alert("You are already friends.");
          return;
        }
      }
      const { error: insertError } = await supabase
        .from("friends")
        .insert([{ sender_id: user.id, receiver_id: receiverId, status: "pending" }]);
      if (insertError) {
        alert("Error sending friend request: " + insertError.message);
        return;
      }
      alert("Friend request sent!");
      setFriendUsername("");
      setShowAddFriendModal(false);
      fetchAllData();
    } catch (err) {
      console.error("Error sending friend request:", err);
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await supabase
        .from("friends")
        .update({ status: "accepted" })
        .eq("id", requestId);
      alert("Friend request accepted!");
      fetchAllData();
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  const declineFriendRequest = async (requestId) => {
    try {
      await supabase.from("friends").delete().eq("id", requestId);
      alert("Friend request declined!");
      fetchAllData();
    } catch (err) {
      console.error("Error declining friend request:", err);
    }
  };

  // Helper: check if user is team owner
  const userIsOwnerOf = (team) => team && team.owner_id === user?.id;

  // ----------------------------
  // Leave Channel (for non-Admin)
  // ----------------------------
  const leaveChannel = async () => {
    if (!user || !currentChannelId) return;
    try {
      const { error } = await supabase
        .from("channel_members")
        .delete()
        .eq("channel_id", currentChannelId)
        .eq("user_id", user.id);
      if (error) {
        console.error("Error leaving channel:", error);
        alert("Error leaving channel.");
      } else {
        alert("You have left the channel.");
        navigate("/app");
      }
    } catch (err) {
      console.error("Error leaving channel:", err);
    }
  };

  // ----------------------------
  // Logout
  // ----------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Profile Showcase */}
      <div className="sidebar-profile">
        <div className="username">{username || "User"}</div>
        <div className="role"> {role || "Member"}</div>

        {/*User Presence indicator */}
        <div className = "user-status">
        <span className={`status-indicator ${getStatusClass(status)}`}></span>
        <span className="status-text">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        </div>
      </div>

      {/* Direct Messages */}
      <div className="section">
        <span className="sidebar-section-title">Direct Messages</span>
        <ul className="dm-list">
          {friends.map((f) => {
            const isSender = f.sender_id === user?.id;
            const friendProfile = isSender ? f.receiver : f.sender;
            return (
              <li
                key={f.id}
                className="dm-item"
                onClick={() => navigate(`/dm/${friendProfile.username}`)}
              >
                <span className={`status-indicator ${getStatusClass(friendProfile.status)}`}></span>
                <span className="dm-username">{friendProfile?.username}</span>
              </li>
            );
          })}
        </ul>
        <button className="add-friend-btn" onClick={() => setShowAddFriendModal(true)}>
          + Add Friend
        </button>
      </div>

      {/* Pending Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="section">
          <span className="sidebar-section-title">Pending Requests</span>
          <ul className="dm-list">
            {friendRequests.map((request) => (
              <li key={request.id} className="dm-item">
                <span>{request.sender?.username} (Pending)</span>
                <button onClick={() => acceptFriendRequest(request.id)}>✅</button>
                <button onClick={() => declineFriendRequest(request.id)}>❌</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Teams Section */}
      <div className="section">
        <span className="sidebar-section-title">Teams</span>
        <ul className="team-list">
          {teams.map(({ team_id, teams: teamData }) => {
            if (!teamData) return null;
            const canManageTeam = role === "Admin" && userIsOwnerOf(teamData);
            return (
              <li key={team_id} className="team-item" style={{ display: "flex", alignItems: "center" }}>
                <button style={{ flex: 1, marginRight: "6px" }} onClick={() => handleTeamSelect(teamData)}>
                  {teamData.name || "Unnamed Team"}
                </button>
                {canManageTeam && (
                  <button style={{ minWidth: "30px" }} onClick={() => openInviteTeamModal(teamData)}>
                    👤+
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        {role === "Admin" && (
          <button className="create-team-btn" onClick={() => setShowTeamModal(true)}>
            Create Team
          </button>
        )}
      </div>

      {/* Channels Section */}
      {selectedTeam && (
        <div className="section">
          <div className="sidebar-section-title">{selectedTeam.name}</div>
          <ul className="channel-list">
            {channelsForDisplay.map((channel) => {
              const locked = channel.membershipStatus !== "accepted";
              return (
                <li
                  key={channel.id}
                  className="channel-item"
                  onClick={() => handleChannelClick(channel)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: locked ? 0.6 : 1,
                    cursor: "pointer",
                  }}
                >
                  <span>{locked ? "🔒 " : ""}{channel.title}</span>
                  {!locked && channel.creator_id === user.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddUserModal(channel);
                      }}
                    >
                      👤+
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <button className="create-channel-btn" onClick={() => setShowChannelModal(true)}>
            Create Channel
          </button>
        </div>
      )}

      {/* Leave Channel (non‑Admin only) */}
      {currentChannelId && role !== "Admin" && (
        <button className="leave-channel-btn" onClick={leaveChannel} style={{ color: "red", marginBottom: "10px" }}>
          Leave Channel
        </button>
      )}

      {/* ============ MODALS ============ */}
      {showTeamModal && (
        <div className="modal">
          <h4>Create a New Team</h4>
          <input
            type="text"
            placeholder="Enter team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={createTeam}>
            Create
          </button>
          <button className="modal-close" onClick={() => setShowTeamModal(false)}>
            Close
          </button>
        </div>
      )}

      {showInviteTeamModal && (
        <div className="modal">
          <h4>Invite user to {teamToInvite?.name}</h4>
          <input
            type="text"
            placeholder="Username"
            value={inviteUsername}
            onChange={(e) => setInviteUsername(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={inviteUserToTeam}>
            Invite
          </button>
          <button className="modal-close" onClick={() => { setShowInviteTeamModal(false); setTeamToInvite(null); }}>
            Close
          </button>
        </div>
      )}

      {showChannelModal && (
        <div className="modal">
          <h4>Create a New Channel</h4>
          <input
            type="text"
            placeholder="Enter channel name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={createChannel}>
            Create
          </button>
          <button className="modal-close" onClick={() => setShowChannelModal(false)}>
            Close
          </button>
        </div>
      )}

      {showAddUserModal && (
        <div className="modal">
          <h4>Add user to {selectedChannel?.title}</h4>
          <input
            type="text"
            placeholder="Enter username"
            value={usernameToAdd}
            onChange={(e) => setUsernameToAdd(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={addUserToChannel}>
            Add
          </button>
          <button className="modal-close" onClick={() => setShowAddUserModal(false)}>
            Close
          </button>
        </div>
      )}

      {showAddFriendModal && (
        <div className="modal">
          <h4>Add a Friend</h4>
          <input
            type="text"
            placeholder="Enter friend's username"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            className="modal-input"
          />
          <button className="modal-button" onClick={sendFriendRequest}>
            Send Request
          </button>
          <button className="modal-close" onClick={() => setShowAddFriendModal(false)}>
            Close
          </button>
        </div>
      )}

      {/* Join Request Confirmation Modal */}
      {showJoinRequestModal && pendingChannel && (
        <div className="modal">
          <h4>Request to Join</h4>
          <p>Do you want to request to join the channel "{pendingChannel.title}"?</p>
          <button
            className="modal-button"
            onClick={async () => {
              await requestToJoinChannel(pendingChannel);
              setShowJoinRequestModal(false);
              setPendingChannel(null);
            }}
          >
            Confirm
          </button>
          <button
            className="modal-close"
            onClick={() => {
              setShowJoinRequestModal(false);
              setPendingChannel(null);
            }}
          >
            Cancel
          </button>
        </div>
      )}

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
