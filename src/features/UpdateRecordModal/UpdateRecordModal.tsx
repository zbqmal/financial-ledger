import { UpdateRecordDraftType } from "../../types/data-types";
import { formatUsDate } from "../../utils/date-utils";

type UpdateRecordModalProps = {
  record: UpdateRecordDraftType | null;
  isAddingRecord: boolean;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
  updateRecordDraft: (field: string, value: string) => void;
  closeModal: () => void;
};

const UpdateRecordModal: React.FC<UpdateRecordModalProps> = ({
  record,
  isAddingRecord,
  onSubmit,
  updateRecordDraft,
  closeModal,
}) => {
  if (!record) return null;

  return (
    <form className="edit-form" onSubmit={onSubmit}>
      <div className="record-meta-grid">
        <div className="record-meta-card">
          <span className="record-meta-label">Date</span>
          <strong>{formatUsDate(record.date)}</strong>
        </div>
        <div className="record-meta-card">
          <span className="record-meta-label">Category</span>
          <strong>{`${record.mainCategory} / ${record.subCategory}`}</strong>
        </div>
      </div>
      <label>
        Amount
        <input
          type="text"
          inputMode="decimal"
          value={record.amount}
          onChange={(event) => updateRecordDraft("amount", event.target.value)}
          placeholder="0.00"
          required
        />
      </label>
      <label className="edit-note-field">
        Note
        <input
          type="text"
          value={record.note}
          onChange={(event) => updateRecordDraft("note", event.target.value)}
          placeholder="What was this about?"
        />
      </label>
      <div className="modal-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => closeModal()}
        >
          Cancel
        </button>
        <button type="submit" className="primary">
          {isAddingRecord ? "Add" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default UpdateRecordModal;
