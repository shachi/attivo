"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Monitor,
  FileText,
  Calendar,
  Globe,
  Shield,
  Package,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Asset, AssetType } from "@/types";

export default function AssetDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 資産データの取得
  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assets/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("資産が見つかりませんでした");
          }
          throw new Error("資産の取得に失敗しました");
        }

        const data = await response.json();
        setAsset(data);
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

    fetchAsset();
  }, [id]);

  // 資産の削除
  const handleDelete = async () => {
    if (!confirm("この資産を削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("資産の削除に失敗しました");
      }

      // 削除成功時、資産一覧ページへリダイレクト
      router.push("/");
    } catch (err) {
      console.error("削除エラー:", err);
      alert("資産の削除中にエラーが発生しました。");
    }
  };

  // アイコンの決定
  const getAssetIcon = (type: AssetType | undefined) => {
    if (!type) return <Package className="w-6 h-6 text-gray-500" />;

    switch (type.name) {
      case "hardware":
        return <Monitor className="w-6 h-6 text-blue-500" />;
      case "software":
        return <FileText className="w-6 h-6 text-purple-500" />;
      case "subscription":
        return <Calendar className="w-6 h-6 text-green-500" />;
      case "domain":
        return <Globe className="w-6 h-6 text-orange-500" />;
      case "ssl_certificate":
        return <Shield className="w-6 h-6 text-red-500" />;
      case "rental":
        return <Package className="w-6 h-6 text-indigo-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  // 日付のフォーマット
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ja-JP");
  };

  // 資産タイプの表示名を取得
  const getAssetTypeLabel = (type: AssetType | undefined): string => {
    if (!type) return "";

    switch (type.name) {
      case "hardware":
        return "ハードウェア";
      case "software":
        return "ソフトウェア";
      case "subscription":
        return "サブスクリプション";
      case "domain":
        return "ドメイン";
      case "ssl_certificate":
        return "SSL証明書";
      case "rental":
        return "レンタル品";
      default:
        return type.name;
    }
  };

  // 残り日数の計算
  const calculateDaysLeft = (asset: Asset | null): number | null => {
    if (!asset) return null;

    let expiryDate: Date | null = null;
    if (asset.warrantyExpiryDate) {
      expiryDate = new Date(asset.warrantyExpiryDate);
    } else if (asset.renewalDate) {
      expiryDate = new Date(asset.renewalDate);
    }

    if (!expiryDate) return null;

    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 状態表示用のスタイルを取得
  const getStatusStyle = (daysLeft: number | null) => {
    if (daysLeft === null)
      return { bgColor: "bg-gray-100", textColor: "text-gray-700" };
    if (daysLeft <= 0)
      return { bgColor: "bg-red-100", textColor: "text-red-800" };
    if (daysLeft <= 30)
      return { bgColor: "bg-red-100", textColor: "text-red-800" };
    if (daysLeft <= 90)
      return { bgColor: "bg-yellow-100", textColor: "text-yellow-800" };
    return { bgColor: "bg-green-100", textColor: "text-green-800" };
  };

  // 状態メッセージを取得
  const getStatusMessage = (daysLeft: number | null): string => {
    if (daysLeft === null) return "期限なし";
    if (daysLeft <= 0) return "期限切れ";
    if (daysLeft <= 30) return `あと${daysLeft}日（要注意）`;
    if (daysLeft <= 90) return `あと${daysLeft}日（注意）`;
    return `あと${daysLeft}日`;
  };

  const daysLeft = asset ? calculateDaysLeft(asset) : null;
  const statusStyle = getStatusStyle(daysLeft);

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
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    資産一覧に戻る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : asset ? (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center">
                <Link
                  href="/"
                  className="mr-4 p-2 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">資産詳細</h1>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/assets/${id}/edit`}
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

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* ヘッダー */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  {getAssetIcon(asset.assetType)}
                  <h2 className="ml-2 text-xl font-semibold text-gray-900">
                    {asset.name}
                  </h2>
                  <span className="ml-3 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    {getAssetTypeLabel(asset.assetType)}
                  </span>

                  <div className="ml-auto flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}
                    >
                      {getStatusMessage(daysLeft)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 基本情報 */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  基本情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      シリアル番号 / ID
                    </p>
                    <p className="mt-1">{asset.serialNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      ステータス
                    </p>
                    <p className="mt-1 capitalize">
                      {asset.status === "active"
                        ? "使用中"
                        : asset.status === "expired"
                          ? "期限切れ"
                          : asset.status === "disposed"
                            ? "廃棄済み"
                            : asset.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">タグ</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {asset.tags ? (
                        asset.tags.split(",").map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-sm font-medium text-gray-500">説明</p>
                    <p className="mt-1">{asset.description || "-"}</p>
                  </div>
                </div>
              </div>

              {/* 購入・契約情報 */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  購入・契約情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      購入日 / 契約日
                    </p>
                    <p className="mt-1">{formatDate(asset.purchaseDate)}</p>
                  </div>
                  {asset.warrantyExpiryDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        保証期限
                      </p>
                      <p className="mt-1">
                        {formatDate(asset.warrantyExpiryDate)}
                      </p>
                    </div>
                  )}
                  {asset.renewalDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        更新日 / 返却日
                      </p>
                      <p className="mt-1">{formatDate(asset.renewalDate)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      購入価格 / 契約金額
                    </p>
                    <p className="mt-1">
                      {asset.purchasePrice
                        ? `${asset.purchasePrice.toLocaleString()} ${asset.currency}`
                        : "-"}
                    </p>
                  </div>
                  {asset.licenseKey && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        ライセンスキー
                      </p>
                      <p className="mt-1 font-mono bg-gray-50 p-1 rounded">
                        {asset.licenseKey}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 担当者情報 */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  担当者情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      購入者 / 契約者
                    </p>
                    <p className="mt-1">{asset.purchasedBy?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      使用者 / 管理者
                    </p>
                    <p className="mt-1">{asset.currentUser?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      保管場所 / 使用場所
                    </p>
                    <p className="mt-1">{asset.location || "-"}</p>
                  </div>
                </div>
              </div>

              {/* 備考 */}
              {asset.notes && (
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    備考
                  </h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="whitespace-pre-line">{asset.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
