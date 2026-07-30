import { useState } from "react";

const useStatusMessage = () => {
  const [status, setStatus] = useState<string>("");

  const showSuccess = (message: string) =>
    setStatus({ message, tone: "success" });
  const showError = (message: string) => setStatus({ message, tone: "error" });
  const showInfo = (message: string) => setStatus({ message, tone: "info" });
  const clearStatus = () => setStatus(null);

  useEffect(() => {
    if (!status) return;
    const id = window.setTimeout(clearStatus, timeoutMs);
    return () => window.clearTimeout(id);
  }, [status, timeoutMs]);

  return { status, showSuccess, showError, showInfo, clearStatus };
};
