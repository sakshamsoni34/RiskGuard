import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { RiskBadge } from "../components/ui/RiskBadge";

describe("RiskBadge Component", () => {
  it("renders LOW risk badge correctly", () => {
    render(<RiskBadge level="LOW" />);
    expect(screen.getByText("LOW RISK")).toBeInTheDocument();
  });

  it("renders MEDIUM risk badge correctly", () => {
    render(<RiskBadge level="MEDIUM" />);
    expect(screen.getByText("MEDIUM RISK")).toBeInTheDocument();
  });

  it("renders HIGH risk badge correctly", () => {
    render(<RiskBadge level="HIGH" />);
    expect(screen.getByText("HIGH RISK")).toBeInTheDocument();
  });

  it("renders CRITICAL risk badge correctly", () => {
    render(<RiskBadge level="CRITICAL" />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  it("displays score when provided", () => {
    render(<RiskBadge level="HIGH" score={88} />);
    expect(screen.getByText("(88)")).toBeInTheDocument();
  });
});
