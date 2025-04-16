"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User as UserIcon,
  Package,
  Mail,
  Calendar,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { User, Asset } from "@/types";

export default function UserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [user, setUser] = useState<User | null>(null);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザーデータ取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        // ユーザー情報を取得
        const userResponse = await fetch(`/api/users/${id}`);
        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            throw new Error("ユーザーが見つかりませんでした");
          }
          throw new Error("ユーザーデータの取得に失敗しました");
        }

        const userData = await userResponse.json();
        setUser(userData);

        // ユーザーに関連する資産を取得
        const assetsResponse = await fetch(`/api/assets?userId=${id}`);
        if (!assetsResponse.ok) {
          throw new Error("資産データの取得に失敗しました");
        }

        const assetsData = await assetsResponse.json();
        setUserAssets(assetsData);

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

    fetchUser();
  }, [id]);

  // ユーザー削除
  const handleDelete = async () => {
    if (!user) return;

    if (
      !confirm(
        `ユーザー "${user.name}" を削除してもよろしいですか？\n\n注意: このユーザーに関連する資産の担当者情報も更新する必要があります。`,
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

      // 削除成功時、ユーザー一覧ページへリダイレクト
      router.push("/users");
    } catch (err) {
      console.error("削除エラー:", err);
      alert("ユーザーの削除中にエラーが発生しました。");
    }
  };

  // ロールの表示名
  const getRoleName = (role?: string): string => {
    if (!role) return "";

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

  // ロールに応じたスタイルを取得
  const getRoleStyle = (role?: string) => {
    if (!role) return { bgColor: "bg-gray-100", textColor: "text-gray-700" };

    switch (role) {
      case "admin":
        return { bgColor: "bg-purple-100", textColor: "text-purple-800" };
      case "buyer":
        return { bgColor: "bg-green-100", textColor: "text-green-800" };
      case "user":
        return { bgColor: "bg-blue-100", textColor: "text-blue-800" };
      default:
        return { bgColor: "bg-gray-100", textColor: "text-gray-700" };
    }
  };

  const roleStyle = getRoleStyle(user?.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">データを読み込み中...</p>
          </div>
        ) : error ? (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            role="alert"
          >
            <div className="flex">
              <div className="py-1">
                <svg
                  className="fill-current h-6 w-6 text-red-500 mr-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">エラー</p>
                <p className="text-sm">{error}</p>
                <div className="mt-4">
                  <Link
                    href="/users"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    ユーザー一覧に戻る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : user ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center">
                <Link
                  href="/users"
                  className="mr-4 p-2 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  ユーザー詳細
                </h1>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/users/${id}/edit`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md flex items-center hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Link>
                <button
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md flex items-center hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  削除
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              {/* ユーザー情報 */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100">
                    <UserIcon className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {user.name}
                    </h2>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${roleStyle.bgColor} ${roleStyle.textColor}`}
                    >
                      {getRoleName(user.role)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      登録日
                    </h3>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <p>
                        {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      最終更新日
                    </h3>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <p>
                        {new Date(user.updatedAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 関連資産セクション */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">関連資産</h3>
              </div>

              {userAssets.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {userAssets.map((asset) => (
                    <div key={asset.id} className="px-6 py-4 hover:bg-gray-50">
                      <Link href={`/assets/${asset.id}`} className="block">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Package className="h-5 w-5 text-gray-400" />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {asset.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {asset.currentUser.id === user.id
                                  ? "使用者"
                                  : "購入者"}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            購入日:{" "}
                            {new Date(asset.purchaseDate).toLocaleDateString(
                              "ja-JP",
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center text-gray-500">
                  このユーザーに関連する資産がありません。
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
