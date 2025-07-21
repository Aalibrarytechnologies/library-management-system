import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useThemeContext } from "../context/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPieChart({ borrowed, returned }) {
  const { theme } = useThemeContext();

  const isDarkMode = theme === "dark";
  const hasData = borrowed + returned > 0;

  const pieData = {
    labels: ["Borrowed", "Returned"],
    datasets: [
      {
        data: [borrowed, returned],
        backgroundColor: isDarkMode
          ? ["#ebebebff", "#8a8a8aff"]
          : ["#3D3E3E", "#151619"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">
        Book Activity
      </h2>
      {hasData ? (
        <Pie data={pieData} />
      ) : (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          No data to display yet
        </p>
      )}
    </div>
  );
}
