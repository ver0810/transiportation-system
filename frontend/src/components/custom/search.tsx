import React, { useState } from "react";

interface SearchComponentProps {
  onSearch: (startPoint: string, endPoint: string) => void; // 搜索回调函数
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch }) => {
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(startPoint, endPoint);
  };

  return (
    <>
      <div className="mt-4 flex items-center space-x-2">
        <div className="w-1 h-5 bg-blue-500"></div>
        <span>选择路线</span>
        <br />
      </div>

      <div className="mt-4">
        <form className="space-y-6 w-full" onSubmit={handleSubmit}>
          <div className="flex space-x-4">
            <label className="text-xl font-bold self-center">起点: </label>
            <input
              type="text"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              placeholder="请输入起点"
              className="flex-grow px-4 py-2 bg-white/20 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-4">
            <label className="text-xl font-bold">终点: </label>
            <input
              type="text"
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              placeholder="请输入终点"
              className="flex-grow px-4 py-2 bg-white/20 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-16 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              搜索
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SearchComponent;
