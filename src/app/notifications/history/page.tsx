// src/app/notifications/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Bell, Filter, Search, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Notification {
  id: string;
  assetId: string;
  asset: {
    id: string;
    name: string;
  };
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  scheduledDate: string;
  sentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // 通知データ取得
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/notifications");

        if (!response.ok) {
          throw new Error("通知データの取得に失敗しました");
        }

        const data = await response.json();
        setNotifications(data);
        setError(null);
      } catch (err) {
        console.error("データ取得エラー:", err);
        setError(
          err instanceof Error ? err.message : "不明なエラーが発生しました",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // 通知を既読/未読に設定
  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("通知ステータスの更新に失敗しました");
      }

      // 成功時、通知リストを更新
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: !currentStatus }
            : notification,
        ),
      );
    } catch (err) {
      console.error("更新エラー:", err);
      alert("通知の更新中にエラーが発生しました。");
    }
  };

  // 通知タイプの表示名
  const getNotificationTypeLabel = (type: string): string => {
    switch (type) {
      case "warranty_expiry":
        return "保証期限切れ";
      case "renewal_due":
        return "更新期限";
      case "return_due":
        return "返却期限";
      case "depreciation_complete":
        return "償却完了";
      case "other":
        return "その他";
      default:
        return type;
    }
  };

  // 検索とフィルタリング
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.asset.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      notification.user.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || notification.type === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "read" && notification.isRead) ||
      (filterStatus === "unread" && !notification.isRead);

    return matchesSearch && matchesType && matchesStatus;
  });

  // 日付のフォーマット
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link
              href="/notifications"
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">通知履歴</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="タイトル、メッセージ、資産名などで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">すべての種類</option>
                  <option value="warranty_expiry">保証期限切れ</option>
                  <option value="renewal_due">更新期限</option>
                  <option value="return_due">返却期限</option>
                  <option value="depreciation_complete">償却完了</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">すべての状態</option>
                  <option value="read">既読</option>
                  <option value="unread">未読</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-500">データを読み込み中...</p>
            </div>
          ) : error ? (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <>
              {filteredNotifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          状態
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          タイトル
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          タイプ
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          対象資産
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          通知先
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          送信日時
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredNotifications.map((notification) => (
                        <tr
                          key={notification.id}
                          className={`hover:bg-gray-50 ${!notification.isRead ? "bg-blue-50" : ""}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {notification.isRead ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <div className="relative">
                                <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                                <Bell className="h-5 w-5 text-blue-500" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {notification.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                notification.type === "warranty_expiry"
                                  ? "bg-blue-100 text-blue-800"
                                  : notification.type === "renewal_due"
                                    ? "bg-green-100 text-green-800"
                                    : notification.type === "return_due"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : notification.type ===
                                          "depreciation_complete"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {getNotificationTypeLabel(notification.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/assets/${notification.assetId}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {notification.asset.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {notification.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {notification.user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(notification.sentDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className={`text-blue-600 hover:text-blue-900 mr-4`}
                              onClick={() =>
                                toggleReadStatus(
                                  notification.id,
                                  notification.isRead,
                                )
                              }
                            >
                              {notification.isRead
                                ? "未読にする"
                                : "既読にする"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">通知はありません</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
