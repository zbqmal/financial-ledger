import { fireEvent, render, screen } from "@testing-library/react";
import Modal from "../Modal";

describe("Modal", () => {
  it("renders title and children", () => {
    render(
      <Modal title="Reset all data" onClose={jest.fn()}>
        <p>content</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Reset all data" })).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("closes on backdrop click and stops inside click", () => {
    const onClose = jest.fn();

    render(
      <Modal title="Reset all data" onClose={onClose}>
        <p>content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("dialog", { name: "Reset all data" }));
    expect(onClose).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByRole("presentation"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
