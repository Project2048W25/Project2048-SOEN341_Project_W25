import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./index.css";

export const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [teams, setTeams] = useState([]);

  // Team selection => Channels
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [channels, setChannels] = useState([]);

  // Team creation
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  // Team invite
  const [showInviteTeamModal, setShowInviteTeamModal] = useState(false);
  const [teamToInvite, setTeamToInvite] = useState(null);
  const [inviteUsername, setInviteUsername] = useState("");

  // Channel creation
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  // Channel invite
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [usernameToAdd, setUsernameToAdd] = useState("");

  useEffect(() => {
    const fetchUserAndTeams = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(user);

      if (user) {
        // 1) Fetch user’s role
        const { data: roleData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (roleData) setRole(roleData.role);

        // 2) Fetch teams (and include owner_id)
        const { data: teamsData, error: teamsError } = await supabase
          .from("team_members")
          .select("team_id, teams(id, name, owner_id)")
          .eq("user_id", user.id);

        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
        } else {
          setTeams(teamsData || []);
        }
      }
    };

    fetchUserAndTeams();

    // Subscribe to changes in team_members
    const teamSubscription = supabase
      .channel("team_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_members" },
        fetchUserAndTeams
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamSubscription);
    };
  }, []);

  const createTeam = async () => {
    if (!newTeamName) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("teams")
        .insert([{ name: newTeamName, owner_id: user.id }])
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        const newTeam = data[0];
        await supabase.from("team_members").insert([
          {
            team_id: newTeam.id,
            user_id: user.id,
            invited_by: user.id,
          },
        ]);
      }
      setNewTeamName("");
      setShowTeamModal(false);
    } catch (err) {
      console.error("Error creating team:", err);
    }
  };

  useEffect(() => {
    if (!selectedTeam) {
      setChannels([]);
      return;
    }
    const fetchChannels = async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("team_id", selectedTeam.id);
      if (error) {
        console.error("Error fetching channels:", error);
      } else {
        setChannels(data || []);
      }
    };
    fetchChannels();
    const channelSubscription = supabase
      .channel("channel_updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "channels" },
        (payload) => {
          if (payload.new.team_id === selectedTeam.id) {
            fetchChannels();
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [selectedTeam]);

  const createChannel = async () => {
    if (!selectedTeam || !newChannelName) return;
    const { data, error } = await supabase
      .from("channels")
      .insert([{ title: newChannelName, team_id: selectedTeam.id }]);
    if (error) {
      console.error("Error creating channel:", error);
    } else {
      setNewChannelName("");
      setShowChannelModal(false);
    }
  };

  const openInviteTeamModal = (team) => {
    setTeamToInvite(team);
    setInviteUsername("");
    setShowInviteTeamModal(true);
  };

  const inviteUserToTeam = async () => {
    if (!teamToInvite || !inviteUsername) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", inviteUsername)
        .single();
      if (profileError || !profileData) {
        alert("User not found.");
        return;
      }
      const userId = profileData.id;
      const { error: insertError } = await supabase.from("team_members").insert([
        {
          team_id: teamToInvite.id,
          user_id: userId,
          invited_by: user.id,
        },
      ]);
      if (insertError) {
        alert("Error inviting user: " + insertError.message);
        return;
      }
      alert("User invited to the team!");
      setShowInviteTeamModal(false);
      setInviteUsername("");
      setTeamToInvite(null);
    } catch (err) {
      console.error("Error inviting user to team:", err);
    }
  };

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
      if (userError || !userData) {
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
        alert("That user is not in this team. Invite them to the team first.");
        return;
      }
      const { error: insertError } = await supabase
        .from("channel_members")
        .insert([{ channel_id: selectedChannel.id, user_id: userId }]);
      if (insertError) {
        alert("Error adding user to channel: " + insertError.message);
        return;
      }
      alert("User added to channel!");
      setShowAddUserModal(false);
      setUsernameToAdd("");
      setSelectedChannel(null);
    } catch (err) {
      console.error("Error adding user to channel:", err);
    }
  };

  const userIsOwnerOf = (team) => {
    return team && team.owner_id === user?.id;
  };

  return (
    <aside className="sidebar">
      <div className="title">ChatHaven</div>

      <div className="section">
        <div className="font-semibold">{user ? user.email : "Loading..."}</div>
      </div>

      <div className="section">
        <span>Teams
        {role === "Admin" && (
          <button
            className="add-user-btn"
            
            onClick={() => setShowTeamModal(true)}
          >
            🌐+
          </button>
        )}
        </span>
        <ul>
          {teams.map(({ team_id, teams: teamData }) => {
            if (!teamData) return null;
            const canManageTeam = role === "Admin" && userIsOwnerOf(teamData);
            return (
              <li
                key={team_id}
                className="text-sm mt-2"
                style={{ display: "flex", alignItems: "center" }}
              >
                <button
                  className="team-button"
                  style={{ flex: 1, marginRight: "6px" }}
                  onClick={() => setSelectedTeam(teamData)}
                >
                  {teamData.name || "Unnamed Team"}
                </button>
                {canManageTeam && (
                  <button
                    className="add-user-btn"
                    style={{ minWidth: "30px" }}
                    onClick={() => openInviteTeamModal(teamData)}
                  >
                    👤+
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {selectedTeam && (
        <div className="channels-sidebar">
          <div className="channels-header">
            <h3>{selectedTeam.name} </h3>
            {role === "Admin" && userIsOwnerOf(selectedTeam) && (
              <button
                className="add-channel-btn"
                onClick={() => setShowChannelModal(true)}
              >
                + Channel
              </button>
            )}
          </div>
          <ul className="channels-list">
            {channels.map((channel) => (
              <li key={channel.id} className="channel-item">
                <span>{channel.title}</span>
                {role === "Admin" && userIsOwnerOf(selectedTeam) && (
                  <button
                    className="add-user-btn"
                    onClick={() => openAddUserModal(channel)}
                  >
                    👤+
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showTeamModal && (
        <div className="modal">
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
          <button
            className="modal-close"
            onClick={() => {
              setShowInviteTeamModal(false);
              setTeamToInvite(null);
            }}
          >
            Close
          </button>
        </div>
      )}

      {showChannelModal && (
        <div className="modal">
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
    </aside>
  );
};

export default Sidebar;
