import { render, screen, fireEvent } from "@testing-library/react";
import GoogleLoginButton from "./GoogleLoginButton.jsx";
import authService from "../services/authService";

jest.mock("../services/authService", () => ({
  googleLogin: jest.fn(),
}));


describe("Google Login Tests", () => {
  test("Google login button renders and triggers login", () => {
    render(<GoogleLoginButton />);
    const button = screen.getByAltText("Sign in with Google");
    fireEvent.click(button);

    expect(authService.googleLogin).toHaveBeenCalled();
  });
});
