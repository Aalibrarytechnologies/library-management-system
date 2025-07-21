import { ReceiptIcon } from "lucide-react";
import { isOverdue } from "../../utils/dateUtils";

export default function CatalogTable({
  isStaff,
  activeTab,
  filteredBooks,
  setShowConfirm,
  setConfirmTitle,
  setConfirmMessage,
  setConfirmAction,
  setRenewingBookId,
  setRenewDate,
  setRenewDueLimit,
  setShowReceipt,
  setReceiptBook,
  token,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-300 dark:border-zinc-700">
            <th className="px-4 py-3">Book ID</th>
            <th className="px-4 py-3">User ID</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Returned Date</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((book) => (
            <tr
              key={book.id}
              className="border-b border-gray-200 dark:border-zinc-700 text-sm"
            >
              <td className="px-4 py-3">{book.book_id}</td>
              <td className="px-4 py-3">{book.user_id}</td>
              <td className="px-4 py-3">{book.due_date}</td>
              <td className="px-4 py-3">{book.returned_date || "--"}</td>
              <td className="px-4 py-3">
                {!isOverdue(book.due_date) ? (
                  <button
                    className="text-purple-600 hover:underline"
                    onClick={() => {
                      setConfirmTitle("Renew Book");
                      setConfirmMessage("");
                      setRenewDate(new Date());
                      setRenewingBookId(book.id);
                      setRenewDueLimit(new Date(book.due_date));
                      setConfirmAction(() => handleRenew);
                      setShowConfirm(true);
                    }}
                  >
                    Renew
                  </button>
                ) : (
                  <span className="text-red-500 italic">Overdue</span>
                )}

                {activeTab === "borrowed" ? (
                  <button
                    className="text-blue-600 hover:underline ml-3"
                    onClick={() => {
                      setConfirmTitle("Return Book");
                      setConfirmMessage(
                        "Are you sure you want to return this book?"
                      );
                      setConfirmAction(() => () => handleReturn(book.id));
                      setShowConfirm(true);
                    }}
                  >
                    Return
                  </button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <button
                      className="text-green-600 hover:underline"
                      onClick={() => {
                        setConfirmTitle("Rebook Book");
                        setConfirmMessage(
                          "Do you want to borrow this book again?"
                        );
                        setConfirmAction(() => () => handleRebook(book));
                        setShowConfirm(true);
                      }}
                    >
                      Rebook
                    </button>
                    <button onClick={() => handleShowReceipt(book.book_id)}>
                      <ReceiptIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}

          {filteredBooks.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-6 text-gray-500">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
