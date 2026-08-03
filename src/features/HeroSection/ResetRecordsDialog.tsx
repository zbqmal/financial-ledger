import Modal from "../../components/Modal/Modal";

type ResetRecordsDialogProps = {
  openResetDialog: (open: boolean) => void;
  confirmResetData: () => void;
};

const ResetRecordsDialog: React.FC<ResetRecordsDialogProps> = ({
  openResetDialog,
  confirmResetData,
}) => {
  return (
    <Modal title="Reset all data" onClose={() => openResetDialog(false)}>
      <p className="modal-copy">
        This will delete all imported and locally saved records.
      </p>
      <div className="modal-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => openResetDialog(false)}
        >
          Cancel
        </button>
        <button type="button" className="primary" onClick={confirmResetData}>
          Reset all data
        </button>
      </div>
    </Modal>
  );
};

export default ResetRecordsDialog;
