import { useState } from "react";
import Modal from "../../components/Modal/Modal";
import { UpdateRecordDraftType } from "../../types/data-types";
import { sanitizeAmountInput } from "../../utils/record-utils";
import UpdateRecordModal from "./UpdateRecordModal";

type RecordFormModalProps = {
  initialDraft: UpdateRecordDraftType;
  isAddingRecord: boolean;
  onSubmit: (draft: UpdateRecordDraftType) => void;
  onClose: () => void;
};

/**
 * Owns the in-progress record draft. Keeping this state here (instead of in
 * App) means typing in the form re-renders only the modal, not the whole page
 * with its table and charts.
 */
const RecordFormModal: React.FC<RecordFormModalProps> = ({
  initialDraft,
  isAddingRecord,
  onSubmit,
  onClose,
}) => {
  const [draft, setDraft] = useState<UpdateRecordDraftType>(initialDraft);

  const updateRecordDraft = (field: string, value: string) => {
    setDraft((previous) => {
      if (field === "amount") {
        const nextAmount = sanitizeAmountInput(value);
        if (nextAmount === null) return previous;

        return { ...previous, amount: nextAmount };
      }

      return { ...previous, [field]: value };
    });
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(draft);
  };

  return (
    <Modal title={isAddingRecord ? "Add Record" : "Edit Record"} onClose={onClose}>
      <UpdateRecordModal
        record={draft}
        isAddingRecord={isAddingRecord}
        onSubmit={handleSubmit}
        updateRecordDraft={updateRecordDraft}
        closeModal={onClose}
      />
    </Modal>
  );
};

export default RecordFormModal;
