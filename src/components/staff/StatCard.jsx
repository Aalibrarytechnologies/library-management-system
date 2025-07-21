// components/dashboard/StatCard.jsx
export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "bg-blue-500",
}) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl shadow-md text-white ${color}`}
    >
      <div>
        <div className="text-sm opacity-90">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
      {Icon && <Icon className="w-8 h-8 opacity-70" />}
    </div>
  );
}
