import "../styles/index.css";
import { useEffect } from "react";

export const AdminView = () => {
  useEffect(() => {
    // Add any additional admin-specific logic here if needed.
  }, []);

  return (
    <div className=" main-container flex items-center justify-center"
    >
      <div className="view-container">
        <h1>Admin Dashboard</h1>
        <p>You are an Admin. Manage Teams/Channels via the Sidebar.</p>
      </div>
    </div>
  );
};

export default AdminView;
