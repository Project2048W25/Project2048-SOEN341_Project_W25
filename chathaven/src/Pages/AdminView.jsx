import "./index.css";

export const AdminView = () => {
  return (
    <div className="main-container">
      <div className="view-container">
        <h1>Welcome to ChatHaven.</h1>
        <p>You are now an admin. Start creating your team.</p>
        <button className="admin-button">+ Create teams</button>
      </div>
    </div>
  );
};

export default AdminView;
