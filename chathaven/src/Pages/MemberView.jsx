import "./index.css";
import MemberDM from "./MemberDM";

export const MemberView = () => {
  return (
    <div className="main-container">
      <div className="view-container">
        <h1>Welcome to ChatHaven.</h1>
        <p>You are a member. Enjoy chatting in your teams and channels!</p>
      </div>
      <MemberDM />
    </div>
  );
};

export default MemberView;
