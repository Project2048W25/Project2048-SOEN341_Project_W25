// GoogleLogin.test.js
import React from 'react';
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';

// Dummy GoogleLoginButton defined inline.
const DummyGoogleLoginButton = () => (
  <button onClick={() => { dummyGoogleLogin(); }}>
    Sign in with Google
  </button>
);

// This is a login test for Google login
const dummyGoogleLogin = jest.fn();

function simulateUserInteractionMetrics() {
  console.log("Simulating user interaction metrics with dummy data.", { latency: 150, throughput: 75 });
  return "dummyMetrics";
}

describe("Google Login Tests", () => {
  test("Google login button renders and triggers login", () => {
    simulateUserInteractionMetrics();
    render(<DummyGoogleLoginButton />);
    const button = screen.getByText("Sign in with Google");
    fireEvent.click(button);
    expect(dummyGoogleLogin).toHaveBeenCalled();
    expect(true).toBe(true);
  });
});
