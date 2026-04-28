import { RouteSearchInfo } from "@/pages/DashboardPage";
import { MoveRight } from "lucide-react";
import React from "react";

interface HistoryComponentProps {
  historyData: Array<RouteSearchInfo>
};


const HistoryComponent: React.FC<HistoryComponentProps> = ({ historyData }) => {
  return (
    <div className="mt-10 mr-4 w-full">
      <div>
        <div className="flex space-x-1 items-center font-bold backdrop-blur-sm">
          <div className="w-1 h-4 bg-blue-500 "></div>
          <span>历史搜索</span>
        </div>

        <div className="mt-2 backdrop-blur-sm">
          <ul>
            {historyData.map((history) => (
              <li className="flex items-center space-x-1" key={history.start + history.end}>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p>{history.start}</p>
                <MoveRight />
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <p>{history.end}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HistoryComponent;
