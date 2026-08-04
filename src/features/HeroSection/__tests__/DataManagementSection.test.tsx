import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import DataManagementSection from "../DataManagementSection";

const mockSuccess = jest.fn();
const mockError = jest.fn();

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: (...args: unknown[]) => mockSuccess(...args),
    error: (...args: unknown[]) => mockError(...args),
  },
}));

describe("DataManagementSection", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    mockSuccess.mockReset();
    mockError.mockReset();

    URL.createObjectURL = jest.fn(() => "blob:mock-url");
    URL.revokeObjectURL = jest.fn();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it("exports backup and shows success toast", () => {
    const records = [
      {
        id: "r1",
        date: "2025-01-01",
        mainCategory: "Income" as const,
        subCategory: "Salary",
        amount: 3000,
        note: "salary",
      },
    ];

    const clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(
      <DataManagementSection
        records={records}
        openResetDialog={jest.fn()}
        updateRecords={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Export data" }));

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(mockSuccess).toHaveBeenCalledWith("Backup exported.");

    clickSpy.mockRestore();
  });

  it("opens reset dialog only when records exist", () => {
    const openResetDialog = jest.fn();

    const { rerender } = render(
      <DataManagementSection
        records={[]}
        openResetDialog={openResetDialog}
        updateRecords={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(openResetDialog).not.toHaveBeenCalled();
    expect(mockError).toHaveBeenCalledWith("No data to reset.");

    rerender(
      <DataManagementSection
        records={[
          {
            id: "r1",
            date: "2025-01-01",
            mainCategory: "Income",
            subCategory: "Salary",
            amount: 1,
            note: "",
          },
        ]}
        openResetDialog={openResetDialog}
        updateRecords={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(openResetDialog).toHaveBeenCalledWith(true);
  });

  it("imports valid json and updates records", async () => {
    const updateRecords = jest.fn();

    const fileContent = JSON.stringify({
      version: 2,
      exportedAt: "2025-01-01T00:00:00.000Z",
      records: [["id-1", "2025-01-01", "Income", "Salary", "10.00", "ok"]],
    });

    const readAsTextMock = jest.fn(function (this: FileReader) {
      Object.defineProperty(this, "result", {
        configurable: true,
        value: fileContent,
      });
      this.onload?.(new ProgressEvent("load"));
    });

    class MockFileReader {
      onload: null | ((event: ProgressEvent<FileReader>) => void) = null;
      result: string | ArrayBuffer | null = null;
      readAsText = readAsTextMock;
    }

    const originalFileReader = window.FileReader;
    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      MockFileReader as unknown as typeof FileReader;

    render(
      <DataManagementSection
        records={[]}
        openResetDialog={jest.fn()}
        updateRecords={updateRecords}
      />,
    );

    const input = document.getElementById("import-backup") as HTMLInputElement;
    const file = new File([fileContent], "backup.json", {
      type: "application/json",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(updateRecords).toHaveBeenCalledTimes(1);
      expect(mockSuccess).toHaveBeenCalledWith("Imported 1 record.");
    });

    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      originalFileReader;
  });

  it("imports multiple records and uses plural success label", async () => {
    const updateRecords = jest.fn();

    const fileContent = JSON.stringify({
      version: 2,
      exportedAt: "2025-01-01T00:00:00.000Z",
      records: [
        ["id-1", "2025-01-01", "Income", "Salary", "10.00", "ok"],
        ["id-2", "2025-01-02", "Income", "Bonus", "20.00", "ok"],
      ],
    });

    const readAsTextMock = jest.fn(function (this: FileReader) {
      Object.defineProperty(this, "result", {
        configurable: true,
        value: fileContent,
      });
      this.onload?.(new ProgressEvent("load"));
    });

    class MockFileReader {
      onload: null | ((event: ProgressEvent<FileReader>) => void) = null;
      result: string | ArrayBuffer | null = null;
      readAsText = readAsTextMock;
    }

    const originalFileReader = window.FileReader;
    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      MockFileReader as unknown as typeof FileReader;

    render(
      <DataManagementSection
        records={[]}
        openResetDialog={jest.fn()}
        updateRecords={updateRecords}
      />,
    );

    const input = document.getElementById("import-backup") as HTMLInputElement;
    const file = new File([fileContent], "backup-two.json", {
      type: "application/json",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(updateRecords).toHaveBeenCalledTimes(1);
      expect(mockSuccess).toHaveBeenCalledWith("Imported 2 records.");
    });

    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      originalFileReader;
  });

  it("ignores import when no file is selected", () => {
    const updateRecords = jest.fn();

    render(
      <DataManagementSection
        records={[]}
        openResetDialog={jest.fn()}
        updateRecords={updateRecords}
      />,
    );

    const input = document.getElementById("import-backup") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });

    expect(updateRecords).not.toHaveBeenCalled();
  });

  it("ignores import when files are missing on event target", () => {
    const updateRecords = jest.fn();

    render(
      <DataManagementSection
        records={[]}
        openResetDialog={jest.fn()}
        updateRecords={updateRecords}
      />,
    );

    const input = document.getElementById("import-backup") as HTMLInputElement;
    fireEvent.change(input, { target: {} });

    expect(updateRecords).not.toHaveBeenCalled();
  });

  it("shows error toast for invalid import", async () => {
    const readAsTextMock = jest.fn(function (this: FileReader) {
      Object.defineProperty(this, "result", {
        configurable: true,
        value: "{bad json",
      });
      this.onload?.(new ProgressEvent("load"));
    });

    class MockFileReader {
      onload: null | ((event: ProgressEvent<FileReader>) => void) = null;
      result: string | ArrayBuffer | null = null;
      readAsText = readAsTextMock;
    }

    const originalFileReader = window.FileReader;
    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      MockFileReader as unknown as typeof FileReader;

    render(
      <DataManagementSection
        records={[]}
        openResetDialog={jest.fn()}
        updateRecords={jest.fn()}
      />,
    );

    const input = document.getElementById("import-backup") as HTMLInputElement;
    const file = new File(["x"], "bad.json", { type: "application/json" });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith(
        "Import failed. Please use a valid financial-ledger backup file.",
      );
    });

    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      originalFileReader;
  });

  it("shows error toast for valid json with invalid shape", async () => {
    const readAsTextMock = jest.fn(function (this: FileReader) {
      Object.defineProperty(this, "result", {
        configurable: true,
        value: JSON.stringify({ version: 2, exportedAt: "x" }),
      });
      this.onload?.(new ProgressEvent("load"));
    });

    class MockFileReader {
      onload: null | ((event: ProgressEvent<FileReader>) => void) = null;
      result: string | ArrayBuffer | null = null;
      readAsText = readAsTextMock;
    }

    const originalFileReader = window.FileReader;
    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      MockFileReader as unknown as typeof FileReader;

    render(
      <DataManagementSection
        records={[]}
        openResetDialog={jest.fn()}
        updateRecords={jest.fn()}
      />,
    );

    const input = document.getElementById("import-backup") as HTMLInputElement;
    const file = new File(["x"], "bad-shape.json", {
      type: "application/json",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith(
        "Import failed. Please use a valid financial-ledger backup file.",
      );
    });

    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      originalFileReader;
  });

  it("shows error toast when records field is not an array", async () => {
    const readAsTextMock = jest.fn(function (this: FileReader) {
      Object.defineProperty(this, "result", {
        configurable: true,
        value: JSON.stringify({ version: 2, exportedAt: "x", records: {} }),
      });
      this.onload?.(new ProgressEvent("load"));
    });

    class MockFileReader {
      onload: null | ((event: ProgressEvent<FileReader>) => void) = null;
      result: string | ArrayBuffer | null = null;
      readAsText = readAsTextMock;
    }

    const originalFileReader = window.FileReader;
    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      MockFileReader as unknown as typeof FileReader;

    render(
      <DataManagementSection
        records={[]}
        openResetDialog={jest.fn()}
        updateRecords={jest.fn()}
      />,
    );

    const input = document.getElementById("import-backup") as HTMLInputElement;
    const file = new File(["x"], "bad-records-shape.json", {
      type: "application/json",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith(
        "Import failed. Please use a valid financial-ledger backup file.",
      );
    });

    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      originalFileReader;
  });

  it("shows error toast when file reader result is empty", async () => {
    const readAsTextMock = jest.fn(function (this: FileReader) {
      Object.defineProperty(this, "result", {
        configurable: true,
        value: null,
      });
      this.onload?.(new ProgressEvent("load"));
    });

    class MockFileReader {
      onload: null | ((event: ProgressEvent<FileReader>) => void) = null;
      result: string | ArrayBuffer | null = null;
      readAsText = readAsTextMock;
    }

    const originalFileReader = window.FileReader;
    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      MockFileReader as unknown as typeof FileReader;

    render(
      <DataManagementSection
        records={[]}
        openResetDialog={jest.fn()}
        updateRecords={jest.fn()}
      />,
    );

    const input = document.getElementById("import-backup") as HTMLInputElement;
    const file = new File(["x"], "empty-result.json", {
      type: "application/json",
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith(
        "Import failed. Please use a valid financial-ledger backup file.",
      );
    });

    (window as unknown as { FileReader: typeof FileReader }).FileReader =
      originalFileReader;
  });
});
