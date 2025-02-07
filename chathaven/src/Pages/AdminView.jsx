import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import "./index.css";

export const AdminView = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");

  // Fetch teams created by the logged-in admin
  useEffect(() => {
    const fetchTeams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("teams")
        .select("id, name")
        .eq("owner_id", user.id);

      if (error) {
        console.error("Error fetching teams:", error);
      } else {
        setTeams(data || []);
      }
    };

    fetchTeams();

    // Real-time updates for new teams
    const teamSubscription = supabase
      .channel('team_updates')
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "teams" },
        fetchTeams
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamSubscription);
    };
  }, []);

  // Create a new team (server)
  const createTeam = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("teams")
      .insert([{ name: teamName, owner_id: user.id }])
      .select();

    if (error) {
      console.error("Error creating team:", error);
    } else {
      setShowTeamModal(false);
      setTeamName("");
    }
  };

  // Invite a user to a team
  const inviteUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedTeam) return;

    // Get user ID from username
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", inviteUsername)
      .single();

    if (error || !data) {
      console.error("User not found:", error);
      return;
    }

    const userId = data.id;

    // Add the user to the team
    const { error: insertError } = await supabase
      .from("team_members")
      .insert([{ team_id: selectedTeam.id, user_id: userId, invited_by: user.id }]);

    if (insertError) {
      console.error("Error inviting user:", insertError);
    } else {
      setShowInviteModal(false);
      setInviteUsername("");
    }
  };

  return (
    <div className="main-container">
      <div className="view-container">
        <h1>Welcome to ChatHaven.</h1>
        <p>You are now an admin. Start creating your team.</p>
        
        {/* Create Team Button */}
        <button className="admin-button" onClick={() => setShowTeamModal(true)}>
          + Create teams
        </button>

        {/* Team List */}
        <h2 className="mt-4">Your Teams</h2>
        <ul>
          {teams.map((team) => (
            <li key={team.id} className="team-item">
              <button 
                className="team-button" 
                onClick={() => setSelectedTeam(team)}
              >
                {team.name}
              </button>
            </li>
          ))}
        </ul>

        {/* Invite Users Button (Only if a team is selected) */}
        {selectedTeam && (
          <button className="admin-button mt-4" onClick={() => setShowInviteModal(true)}>
            + Invite Users to {selectedTeam.name}
          </button>
        )}

        {/* Create Team Modal */}
        {showTeamModal && (
          <div className="modal">
            <input
              type="text"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="modal-input"
            />
            <button className="modal-button" onClick={createTeam}>Create</button>
            <button className="modal-close" onClick={() => setShowTeamModal(false)}>Close</button>
          </div>
        )}

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="modal">
            <input
              type="text"
              placeholder="Enter username"
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              className="modal-input"
            />
            <button className="modal-button" onClick={inviteUser}>Invite</button>
            <button className="modal-close" onClick={() => setShowInviteModal(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
