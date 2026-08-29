"use client";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function MemberChartWidget() {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Simuler des données (à remplacer par un appel API)
    const labels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
    const members = [100, 250, 400, 650, 900, 1234];

    setChartData({
      labels,
      datasets: [
        {
          label: "Nombre de membres",
          data: members,
          borderColor: "#008000",
          backgroundColor: "rgba(0, 128, 0, 0.2)",
          tension: 0.3,
        },
      ],
    });
  }, []);

  if (!chartData) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📈 Évolution des membres</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: { legend: { position: "bottom" } },
        }}
      />
    </div>
  );
}
