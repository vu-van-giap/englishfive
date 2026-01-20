import React, { useState, useEffect } from "react";
import StatsCard from "./StatsCard";
import { getStats, getHistory } from "../../services/listening";

const ListeningStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Không thể tải thống kê. Vui lòng thử lại.");
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await getHistory({ page: 1, limit: 10 });
      if (response.success) {
        setHistory(response.items);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: "Tổng bài làm",
      value: stats?.totalAttempts?.toString() || "0",
      description: "Số bài đã hoàn thành",
      color: "blue",
      icon: (
        <svg
          className="w-6 h-6 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      trend: stats?.totalAttempts ? { up: true, value: 12 } : null,
    },
    {
      title: "Điểm trung bình",
      value: `${stats?.averageScore || 0}/100`,
      description: "Trung bình các bài làm",
      color: "green",
      icon: (
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      trend:
        stats?.averageScore > 70
          ? { up: true, value: 5 }
          : { up: false, value: 3 },
    },
    {
      title: "Điểm cao nhất",
      value: "100/100",
      description: "Bài làm tốt nhất",
      color: "yellow",
      icon: (
        <svg
          className="w-6 h-6 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
      trend: { up: true, value: 0 },
    },
    {
      title: "Thời gian luyện",
      value: "4h 30m",
      description: "Tổng thời gian học",
      color: "purple",
      icon: (
        <svg
          className="w-6 h-6 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      trend: { up: true, value: 25 },
    },
  ];
  if (error)
    return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Thống Kê Cá Nhân</h1>
        <p className="text-gray-600 mt-2">Theo dõi tiến độ học tập của bạn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900">Hoạt động gần đây</h3>
        </div>
        <div className="p-4">
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Hoàn thành bài tập
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.exercise?.title || `Bài tập ${item.exerciseId}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      {item.score}/100
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chưa có lịch sử làm bài
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Hãy bắt đầu làm bài tập để xem thống kê.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-gray-900 mb-4">Gợi ý cải thiện</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start p-3 bg-white rounded-lg border">
            <div>
              <p className="font-medium">Điểm mạnh</p>
              <p className="text-sm text-gray-600">
                {stats?.averageScore >= 80
                  ? "Kỹ năng nghe rất tốt. Hãy duy trì!"
                  : "Hãy luyện tập thêm để cải thiện điểm số"}
              </p>
            </div>
          </div>

          <div className="flex items-start p-3 bg-white rounded-lg border">
            <svg
              className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium">Cần cải thiện</p>
              <p className="text-sm text-gray-600">
                {stats?.totalAttempts < 5
                  ? "Hãy làm nhiều bài tập hơn để cải thiện kỹ năng"
                  : "Tập trung vào các bài khó hơn"}
              </p>
            </div>
          </div>

          <div className="flex items-start p-3 bg-white rounded-lg border">
            <svg
              className="w-5 h-5 text-blue-500 mr-3 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium">Mục tiêu</p>
              <p className="text-sm text-gray-600">
                Đặt mục tiêu làm ít nhất 5 bài tập mỗi tuần
              </p>
            </div>
          </div>

          <div className="flex items-start p-3 bg-white rounded-lg border">
            <div>
              <p className="font-medium">Tiếp theo</p>
              <p className="text-sm text-gray-600">
                Thử các bài tập về chủ đề mới như Kinh doanh hoặc Khoa học
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningStatsPage;
