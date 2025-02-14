import "./index.css";
import { supabase } from "../utils/supabaseClient";
import { useEffect } from "react";

export const AdminView = () => {
  useEffect(() => {
    // Optional: if there's anything else to do on AdminView mount, do it here
    // Otherwise, this can be entirely empty
  }, []);

  return (
    <div className="main-container">
      <div className="view-container">
        <h1>Welcome to ChatHaven.</h1>
        <p>You are now an admin.</p>
        <p>(Everything is handled via the sidebar.)</p>
      </div>
    </div>
  );
};

export default AdminView;
