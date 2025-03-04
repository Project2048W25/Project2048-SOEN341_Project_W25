import "./index.css";

export const MemberView = () => {
  return (
    <div className="main-container" style={{ alignItems: "center", justifyContent: "center" }}>
      <div className="view-container">
        <h1>Welcome to ChatHaven</h1>
        <p>You are a regular member. Add friends and join teams to start chatting.</p>
        <button className="send-button">+ Add Friend</button>
      </div>
    </div>
  );
};

export default MemberView;
