import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import GoogleLoginButton from "./GoogleLoginButton"; 
import authService from "../services/auth";

jest.mock("../services/auth", () => ({
  googleLogin: jest.fn(),
}));

describe("Google Login Tests", () => {
  test("Google login button renders and triggers login", () => {
    render(<GoogleLoginButton />);
    const button = screen.getByText("Sign in with Google");
    fireEvent.click(button);

    expect(authService.googleLogin).toHaveBeenCalled();
  });
});
