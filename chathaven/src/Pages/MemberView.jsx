import "./index.css";
//import { MemberDM } from "./MemberDM"; // Import MemberDM component
export const MemberView = () => {
  return (
      <div className="main-container min-h-screen flex justify-center items-center">
          <div className="view-container text-center p-6 max-w-lg w-full">
              <h1 className="text-3xl font-bold mb-4">Welcome to ChatHaven.</h1>
              <p className="mb-4">Add friends and join teams.</p>
              <button className="member-button bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                  + Add Friends
              </button>
          </div>
      </div>
  );
};

export default MemberView;
