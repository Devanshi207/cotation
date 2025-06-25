import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export const ChartSection = () => {
  const barData = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'],
    datasets: [
      {
        label: 'CRM',
        data: [40, 30, 50, 70, 60, 80, 40, 20],
        backgroundColor: '#A05AFF',
      },
      {
        label: 'USA',
        data: [20, 10, 40, 30, 70, 40, 60, 30],
        backgroundColor: '#1BCFB4',
      },
      {
        label: 'UK',
        data: [30, 20, 50, 40, 60, 30, 50, 40],
        backgroundColor: '#FE9496',
      },
    ],
  };

  const doughnutData = {
    labels: ['Search Engines', 'Direct Click', 'Bookmarks Click'],
    datasets: [
      {
        data: [30, 30, 40],
        backgroundColor: ['#4BCEEB', '#FE9496', '#9E58FF'],
      },
    ],
  };

  return (
    <div className="flex gap-6 mt-6">
      <div className="w-2/3 bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg mb-4">Visit and Sales Statistics</h4>
        <Bar data={barData} />
      </div>
      <div className="w-1/3 bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg mb-4">Traffic Sources</h4>
        <Doughnut data={doughnutData} />
      </div>
    </div>
  );
};
