import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import ChannelDM from "./ChannelDM.jsx"; // Adjust if necessary
import chatService from "../services/chat";

jest.mock("../services/chat", () => ({
  sendMessage: jest.fn(),
  receiveMessage: jest.fn(),
}));

describe("Chat Functionality Tests", () => {
  test("Chat page renders correctly", () => {
    render(<Router><ChannelDM /></Router>);
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
  });

  test("User can send a message", () => {
    render(<Router><ChannelDM /></Router>);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello!" } });
    fireEvent.keyPress(input, { key: "Enter", code: "Enter" });

    expect(chatService.sendMessage).toHaveBeenCalledWith("Hello!");
  });
});
