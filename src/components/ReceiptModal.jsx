// src/components/ReceiptModal.jsx
import ModalWrapper from "./ModalWrapper";

export default function ReceiptModal({ onClose, book }) {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="text-left">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
          Borrowed Book Details
        </h2>
        <ul className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
          <li>
            <span className="font-medium">Book ID:</span> {book?.id ?? "—"}
          </li>
          <li>
            <span className="font-medium">Title:</span> {book?.title ?? "—"}
          </li>
          <li>
            <span className="font-medium">ISBN:</span> {book?.isbn ?? "—"}
          </li>
          <li>
            <span className="font-medium">Author:</span> {book?.author ?? "—"}
          </li>
        </ul>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
