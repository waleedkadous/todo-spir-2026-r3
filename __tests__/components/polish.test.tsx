import { render, screen } from "@testing-library/react";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { StorageWarning } from "@/components/StorageWarning";
import { EmptyState } from "@/components/EmptyState";

describe("PrivacyNotice", () => {
  it("should render privacy disclosure about Gemini", () => {
    render(<PrivacyNotice />);
    expect(screen.getByText(/Google Gemini API/)).toBeInTheDocument();
    expect(screen.getByText(/natural language processing/)).toBeInTheDocument();
  });
});

describe("StorageWarning", () => {
  it("should render localStorage unavailable warning", () => {
    render(<StorageWarning />);
    expect(screen.getByText(/localStorage is not available/)).toBeInTheDocument();
    expect(screen.getByText(/will not persist/)).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("should render empty state message", () => {
    render(<EmptyState />);
    expect(screen.getByText("No todos yet")).toBeInTheDocument();
    expect(screen.getByText(/Add one/)).toBeInTheDocument();
  });
});
