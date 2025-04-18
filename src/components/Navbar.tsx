"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Bell, Users, Settings } from "lucide-react";

const Navbar = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // 未読通知のカウントを取得
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications?isRead=false");
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.length);
        }
      } catch (error) {
        console.error("未読通知の取得に失敗しました:", error);
      }
    };

    fetchUnreadCount();

    // 1分ごとに再取得（オプション）
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Package className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl">資産管理</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  資産一覧
                </Link>
                <Link
                  href="/assets/new"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  新規登録
                </Link>
                <Link
                  href="/users"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  ユーザー管理
                </Link>
                <Link
                  href="/notifications"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  通知設定
                </Link>
                <Link
                  href="/notifications/history"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  通知履歴
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Link
                href="/notifications/history"
                className="relative p-1 rounded-full hover:bg-gray-700 focus:outline-none"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <button className="ml-3 p-1 rounded-full hover:bg-gray-700 focus:outline-none">
                <Settings className="h-6 w-6" />
              </button>
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="bg-gray-300 text-gray-800 rounded-full h-8 w-8 flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="ml-2">管理者</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
