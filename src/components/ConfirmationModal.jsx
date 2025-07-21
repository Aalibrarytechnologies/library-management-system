// src/components/ConfirmationModal.jsx
import ModalWrapper from "./ModalWrapper";

export default function ConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
  children,
}) {
  return (
    <ModalWrapper onClose={onCancel}>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-2">
          {title}
        </h2>

        {children ? (
          <div className="mb-6">{children}</div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
