import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Chat from "./Chat";  
import chatService from "../services/chat";

jest.mock("../services/chat", () => ({
  joinGroup: jest.fn(),
}));

describe("Group Joining Tests", () => {
  test("User can join a group", () => {
    render(<Chat />);
    const joinButton = screen.getByText("Join Group");
    fireEvent.click(joinButton);

    expect(chatService.joinGroup).toHaveBeenCalled();
  });
});
