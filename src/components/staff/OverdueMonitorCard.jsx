// components/dashboard/OverdueMonitorCard.jsx
export default function OverdueMonitorCard({ overdueBooks = [] }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        Overdue Borrowers
      </h3>
      {overdueBooks.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          No overdue books at the moment.
        </div>
      ) : (
        <ul className="space-y-3">
          {overdueBooks.slice(0, 5).map((entry) => (
            <li
              key={entry.id}
              className="text-sm text-gray-800 dark:text-gray-200"
            >
              <span className="font-medium">{entry.user_id}</span> –{" "}
              <span>{entry.book_id}</span>{" "}
              <span className="text-red-500">({entry.due_date})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
