// src/pages/Dashboard.jsx
import React from "react";
import DashboardCard from "../components/DashboardCard";
import { ChartSection } from "../components/ChartSection";

const Dashboard = () => (
  <div /*  NO ml-64 / pl-64 here  */>
    <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard
        title="Weekly Sales"
        value="$15,000"
        subtitle="Increased by 40%"
        gradient="linear-gradient(180deg,#fe9496 0%,#f85b66 100%)"  
        waveColor="#ffffff"
      />
      <DashboardCard
        title="Weekly Orders"
        value="45,6334"
        subtitle="Decreased by 10%"
        gradient="linear-gradient(180deg,#4bceeb 0%,#1d9fe6 100%)"
        waveColor="#ffffff"
      />
      <DashboardCard
        title="Visitors Online"
        value="95,5741"
        subtitle="Increased by 5%"
        gradient="linear-gradient(180deg,#1BCFB4 0%,#0fa39a 100%)"
        waveColor="#ffffff"
      />
    </div>

    <ChartSection />
  </div>
);

export default Dashboard;
