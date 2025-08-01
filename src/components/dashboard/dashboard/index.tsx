import React from "react";
import Link from "next/link";
import DashboardHeader from "@/layouts/headers/DashboardHeader";
import DashboardHeroCard from "./DashboardHeroCard";
import DashboardStatisticsChart from "./DashboardStatisticsChart";
import DashboardActivityTab from "./DashboardActivityTab";
import DashboardFeaturedCard from "./DashboardFeaturedCard";
import DashboardPriceHistory from "./DashboardPriceHistory";
import DashboardTodaysPick from "./DashboardTodaysPick";
import DashboardTopAuthorBuyer from "./DashboardTopAuthorBuyer";

const Dashboard = () => {
	return (
		<>
			<DashboardHeader />
			<div className="create-new-button">
				<Link
					className="shadow-lg btn btn-warning"
					href="/create-new"
					data-bs-toggle="tooltip"
					data-bs-placement="left"
					title="Create New NFT"
				>
					<i className="fz-18 bi bi-plus-lg"></i>
				</Link>
			</div>
			<div className="admin-wrapper">
				<div className="container">
					<div className="row g-4">
						<DashboardHeroCard />
						<DashboardStatisticsChart />
						<DashboardActivityTab />
						<DashboardFeaturedCard />
						<DashboardPriceHistory />
						<DashboardTodaysPick />
						<DashboardTopAuthorBuyer />
					</div>
				</div>
			</div>
		</>
	);
};

export default Dashboard;
