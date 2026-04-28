import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/custom/layout/UserAvatar";
import TrafficFlowMap from "@/components/custom/map/TrafficFlow";
import CongestionIndex from "@/components/custom/charts/CongestionIndex";
import TrafficTrend from "@/components/custom/charts/TrafficTrend";
import HotspotsList from "@/components/custom/charts/HotspotsList";
import TrafficSummary from "@/components/custom/charts/TrafficSummary";
import TrafficPrediction from "@/components/custom/charts/TrafficPrediction";

const DashboardPage2 = () => {
  return (
    <div className="w-full h-screen relative">
      {/* 地图作为背景 */}
      <div className="absolute inset-0 z-0">
        <TrafficFlowMap />
      </div>

      {/* UI层，浮在地图上方 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="flex w-full h-full">
          {/* 左侧栏 */}
          <div className="w-[400px] bg-gradient-to-r from-black to-transparent p-4 flex flex-col pointer-events-auto overflow-y-auto custom-scrollbar">
            <div className="flex w-full mb-4">
              <Link to={"/dashboard"}>
                <Button className="rounded-none w-32 hover:bg-blue-600 transition duration-500">
                  路线优化
                </Button>
              </Link>
              <Button className="rounded-none w-32 bg-blue-500 hover:bg-blue-500">交通流量分析</Button>
            </div>

            <div className="mb-4">
              <h1 className="font-bold text-2xl text-white">交通流量分析</h1>
              <p className="text-xs text-white">
                Analysis of Shenzhen transiportation
              </p>
            </div>
            <CongestionIndex />
            <TrafficTrend />
            <HotspotsList />
            <div className="h-4"></div>
          </div>

          <div className="flex-grow"></div>

          <div className="w-[320px] bg-gradient-to-l from-black to-transparent flex flex-col p-4 pointer-events-auto overflow-y-auto custom-scrollbar">
            <div className="mb-6 self-end">
              <UserAvatar />
            </div>

            <div className="mt-4">
              <TrafficSummary />
            </div>

            <div className="mt-4">
              <TrafficPrediction />
            </div>
            <div className="h-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage2;
