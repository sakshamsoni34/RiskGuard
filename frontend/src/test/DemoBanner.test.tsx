import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { DemoBanner } from "../components/layout/DemoBanner";

describe("DemoBanner Component", () => {
  it("renders the demo environment banner", () => {
    render(<DemoBanner />);
    expect(screen.getByText("DEMO ENVIRONMENT")).toBeInTheDocument();
  });

  it("displays synthetic data and non-evidentiary notice", () => {
    render(<DemoBanner />);
    expect(
      screen.getByText(/AI Risk scores are investigative prioritization leads, NOT evidentiary proof of crime/i)
    ).toBeInTheDocument();
  });
});
