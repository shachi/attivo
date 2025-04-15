"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  User,
  Plus,
  BarChart2,
  Monitor,
  FileText,
  Calendar,
  Globe,
  Shield,
  Package,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Asset, AssetType, User as UserType } from "@/types";

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 資産データ取得
        const assetsRes = await fetch("/api/assets");
        if (!assetsRes.ok) throw new Error("資産データの取得に失敗しました");
        const assetsData = await assetsRes.json();

        // 資産タイプ取得
        const typesRes = await fetch("/api/asset-types");
        if (!typesRes.ok) throw new Error("資産タイプの取得に失敗しました");
        const typesData = await typesRes.json();

        // ユーザーリスト取得
        const usersRes = await fetch("/api/users");
        if (!usersRes.ok) throw new Error("ユーザーリストの取得に失敗しました");
        const usersData = await usersRes.json();

        setAssets(assetsData);
        setAssetTypes(typesData);
        setUsers(usersData);
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

    fetchData();
  }, []);

  // 検索とフィルタリング
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.serialNumber &&
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      asset.purchasedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.currentUser.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || asset.assetType.name === filterType;
    const matchesUser =
      filterUser === "all" ||
      asset.currentUser.id === filterUser ||
      asset.purchasedBy.id === filterUser;

    return matchesSearch && matchesType && matchesUser;
  });

  // 期限切れそうな資産をハイライト
  const getStatusClass = (daysUntilExpiry: number | undefined) => {
    if (!daysUntilExpiry) return "bg-white border-gray-200";
    if (daysUntilExpiry <= 30) return "bg-red-50 border-red-200";
    if (daysUntilExpiry <= 90) return "bg-yellow-50 border-yellow-200";
    return "bg-white border-gray-200";
  };

  const getStatusText = (daysUntilExpiry: number | undefined) => {
    if (!daysUntilExpiry) return "期限なし";
    if (daysUntilExpiry <= 30) return "要注意";
    if (daysUntilExpiry <= 90) return "注意";
    return "正常";
  };

  // アイコンの決定
  const getAssetIcon = (type: string) => {
    switch (type) {
      case "hardware":
        return <Monitor className="w-5 h-5 text-blue-500" />;
      case "software":
        return <FileText className="w-5 h-5 text-purple-500" />;
      case "subscription":
        return <Calendar className="w-5 h-5 text-green-500" />;
      case "domain":
        return <Globe className="w-5 h-5 text-orange-500" />;
      case "ssl_certificate":
        return <Shield className="w-5 h-5 text-red-500" />;
      case "rental":
        return <Package className="w-5 h-5 text-indigo-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  // 日付のフォーマット
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  // 資産タイプの表示名を取得
  const getAssetTypeLabel = (typeName: string): string => {
    switch (typeName) {
      case "hardware":
        return "ハード";
      case "software":
        return "ソフト";
      case "subscription":
        return "サブスク";
      case "domain":
        return "ドメイン";
      case "ssl_certificate":
        return "SSL証明書";
      case "rental":
        return "レンタル";
      default:
        return typeName;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">資産一覧</h1>
          <div className="flex space-x-2">
            <Link
              href="/assets/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規資産登録
            </Link>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md flex items-center hover:bg-gray-300">
              <BarChart2 className="w-4 h-4 mr-2" />
              レポート
            </button>
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
                  placeholder="資産名、シリアル番号、担当者名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">すべての種類</option>
                  {assetTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {getAssetTypeLabel(type.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                >
                  <option value="all">すべてのユーザー</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
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
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-4">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer ${getStatusClass(asset.daysUntilExpiry)}`}
                      onClick={() =>
                        (window.location.href = `/assets/${asset.id}`)
                      }
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          {getAssetIcon(asset.assetType.name)}
                          <h3 className="ml-2 text-lg font-medium text-gray-900">
                            {asset.name}
                          </h3>
                          <span className="ml-3 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {getAssetTypeLabel(asset.assetType.name)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              !asset.daysUntilExpiry
                                ? "bg-gray-100 text-gray-800"
                                : asset.daysUntilExpiry <= 30
                                  ? "bg-red-100 text-red-800"
                                  : asset.daysUntilExpiry <= 90
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {getStatusText(asset.daysUntilExpiry)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            シリアル番号 / ID
                          </p>
                          <p className="text-sm font-medium">
                            {asset.serialNumber || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            購入者 / 契約者
                          </p>
                          <p className="text-sm font-medium">
                            {asset.purchasedBy.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            使用者 / 管理者
                          </p>
                          <p className="text-sm font-medium">
                            {asset.currentUser.name}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            購入日 / 契約日
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(asset.purchaseDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            {asset.assetType.name === "hardware"
                              ? "保証期限"
                              : "更新日 / 返却日"}
                          </p>
                          <p className="text-sm font-medium">
                            {formatDate(
                              asset.warrantyExpiryDate || asset.renewalDate,
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">残り日数</p>
                          <p
                            className={`text-sm font-medium ${
                              !asset.daysUntilExpiry
                                ? "text-gray-600"
                                : asset.daysUntilExpiry <= 30
                                  ? "text-red-600"
                                  : asset.daysUntilExpiry <= 90
                                    ? "text-yellow-600"
                                    : "text-green-600"
                            }`}
                          >
                            {asset.daysUntilExpiry
                              ? `${asset.daysUntilExpiry}日`
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      該当する資産が見つかりませんでした。
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
