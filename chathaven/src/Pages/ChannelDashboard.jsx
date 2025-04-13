// File: ./Pages/ChannelDashboard.jsx
import { useParams } from "react-router-dom";
import ChannelDM from "./ChannelDM";
import MembersList from "./MembersList";
import "../styles/index.css";

export const ChannelDashboard = () => {
  const { channelId } = useParams();
  return (
    <div className="channel-dashboard">
      <div className="channel-dm-container">
        <ChannelDM />
      </div>
      <div className="members-list-container">
        <MembersList channelId={channelId} />
      </div>
    </div>
  );
};

export default ChannelDashboard;
