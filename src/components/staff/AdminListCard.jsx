// components/dashboard/AdminListCard.jsx
export default function AdminListCard({ admins = [] }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
        Admin List
      </h3>
      {admins.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
          No admins found.
        </div>
      ) : (
        <ul className="space-y-3">
          {admins.map((admin) => (
            <li
              key={admin.id}
              className="text-sm text-gray-800 dark:text-gray-200"
            >
              {admin.name} –{" "}
              <span className="italic text-blue-600 dark:text-blue-400">
                {admin.role}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
