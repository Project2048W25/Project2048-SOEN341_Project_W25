import "./index.css";
import { supabase } from "../utils/supabaseClient";
import { useEffect } from "react";
import MemberDM from "./MemberDM";

export const AdminView = () => {
  useEffect(() => {
    // Optional: if there's anything else to do on AdminView mount, do it here
  }, []);

  return (
    <div className="main-container">
      <div className="view-container">
        <h1>Welcome to ChatHaven.</h1>
        <p>You are now an admin.</p>
        <p>(Everything is handled via the sidebar.)</p>
      </div>
      <MemberDM />
    </div>
  );
};

export default AdminView;
