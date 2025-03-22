import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Chat from "./Chat";  // Adjust if necessary
import chatService from "../services/chat";

jest.mock("../services/chat", () => ({
  sendMessage: jest.fn(),
  receiveMessage: jest.fn(),
}));

describe("Chat Functionality Tests", () => {
  test("Chat page renders correctly", () => {
    render(<Chat />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
  });

  test("User can send a message", () => {
    render(<Chat />);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello!" } });
    fireEvent.keyPress(input, { key: "Enter", code: "Enter" });

    expect(chatService.sendMessage).toHaveBeenCalledWith("Hello!");
  });
});
