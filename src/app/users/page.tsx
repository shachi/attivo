"use client";

import { useState, useEffect } from "react";
import { Search, Plus, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { User } from "@/types";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ユーザーデータ取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/users");

        if (!response.ok) {
          throw new Error("ユーザーデータの取得に失敗しました");
        }

        const data = await response.json();
        setUsers(data);
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

    fetchUsers();
  }, []);

  // ユーザー削除
  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `ユーザー "${name}" を削除してもよろしいですか？\n\n注意: このユーザーに関連する資産の担当者情報も更新する必要があります。`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("ユーザーの削除に失敗しました");
      }

      // 成功時、ユーザーリストを更新
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      console.error("削除エラー:", err);
      alert("ユーザーの削除中にエラーが発生しました。");
    }
  };

  // 検索フィルタリング
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ロールの表示名
  const getRoleName = (role: string): string => {
    switch (role) {
      case "buyer":
        return "購入者";
      case "user":
        return "使用者";
      case "admin":
        return "管理者";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
          <div className="flex space-x-2">
            <Link
              href="/users/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規ユーザー作成
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ユーザー名、メールアドレス、役割で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ユーザー
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      メールアドレス
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      役割
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      登録日
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
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "buyer"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {getRoleName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/users/${user.id}`}
                            className="text-gray-600 hover:text-gray-900 mr-4"
                          >
                            詳細
                          </Link>
                          <Link
                            href={`/users/${user.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            編集
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(user.id, user.name)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "検索条件に一致するユーザーが見つかりませんでした。"
                          : "ユーザーがまだ登録されていません。"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
