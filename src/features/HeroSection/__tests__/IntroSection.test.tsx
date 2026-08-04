import { render, screen } from "@testing-library/react";
import IntroSection from "../IntroSection";

describe("IntroSection", () => {
  it("renders hero copy", () => {
    render(<IntroSection />);

    expect(screen.getByText("Personal finance ledger")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Simple, modern money tracking for your own monthly flow/i,
      }),
    ).toBeInTheDocument();
  });
});
