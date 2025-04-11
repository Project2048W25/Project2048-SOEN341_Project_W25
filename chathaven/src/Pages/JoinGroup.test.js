import { BrowserRouter as Router } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import ChannelDM from "./ChannelDM.jsx";
import chatService from "../services/chat";

jest.mock("../services/chat", () => ({
  joinGroup: jest.fn(),
}));

describe("Group Joining Tests", () => {
  test("User can join a group", () => {
    render(<Router><ChannelDM /></Router>);
    const joinButton = screen.getByText("Join Group");
    fireEvent.click(joinButton);

    expect(chatService.joinGroup).toHaveBeenCalled();
  });
});
