import { fireEvent, render, screen } from "@testing-library/react";
import ResetRecordsDialog from "../ResetRecordsDialog";

describe("ResetRecordsDialog", () => {
  it("supports cancel and confirm actions", () => {
    const openResetDialog = jest.fn();
    const confirmResetData = jest.fn();

    render(
      <ResetRecordsDialog
        openResetDialog={openResetDialog}
        confirmResetData={confirmResetData}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(openResetDialog).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Reset all data" }));
    expect(confirmResetData).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("presentation"));
    expect(openResetDialog).toHaveBeenCalledWith(false);
  });
});
