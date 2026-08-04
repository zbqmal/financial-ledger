import { fireEvent, render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders children and handles click", () => {
    const onClick = jest.fn();

    render(
      <Button className="primary" onClick={onClick}>
        Export data
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Export data" });
    expect(button).toHaveClass("primary");

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
