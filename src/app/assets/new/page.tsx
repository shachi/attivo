"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { X, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AssetType, User } from "@/types";

interface FormData {
  name: string;
  assetType: string;
  assetTypeId: string;
  serialNumber: string;
  description: string;
  purchaseDate: string;
  warrantyExpiryDate: string;
  renewalDate: string;
  purchasePrice: string;
  currency: string;
  purchasedById: string;
  currentUserId: string;
  location: string;
  notes: string;
  licenseKey: string;
  tags: string;
}

export default function NewAsset() {
  const router = useRouter();

  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    assetType: "",
    assetTypeId: "",
    serialNumber: "",
    description: "",
    purchaseDate: "",
    warrantyExpiryDate: "",
    renewalDate: "",
    purchasePrice: "",
    currency: "JPY",
    purchasedById: "",
    currentUserId: "",
    location: "",
    notes: "",
    licenseKey: "",
    tags: "",
  });

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 資産タイプ取得
        const typesRes = await fetch("/api/asset-types");
        if (!typesRes.ok) throw new Error("資産タイプの取得に失敗しました");
        const typesData = await typesRes.json();

        // ユーザーリスト取得
        const usersRes = await fetch("/api/users");
        if (!usersRes.ok) throw new Error("ユーザーリストの取得に失敗しました");
        const usersData = await usersRes.json();

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

  // 資産タイプに基づいて表示するフィールドを制御
  const showField = (field: string): boolean => {
    if (!formData.assetTypeId) return false;

    const selectedType = assetTypes.find(
      (type) => type.id === formData.assetTypeId,
    );
    if (!selectedType) return false;

    switch (field) {
      case "warrantyExpiryDate":
        return ["hardware", "rental"].includes(selectedType.name);
      case "renewalDate":
        return ["subscription", "domain", "ssl_certificate", "rental"].includes(
          selectedType.name,
        );
      case "licenseKey":
        return ["software", "subscription"].includes(selectedType.name);
      default:
        return true;
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "assetTypeId") {
      // 資産タイプが変更された場合、関連フィールドをリセット
      setFormData({
        ...formData,
        [name]: value,
        warrantyExpiryDate: "",
        renewalDate: "",
        licenseKey: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 必須フィールドのバリデーション
    if (
      !formData.name ||
      !formData.assetTypeId ||
      !formData.purchaseDate ||
      !formData.purchasedById ||
      !formData.currentUserId
    ) {
      alert("必須項目を入力してください。");
      return;
    }

    try {
      setSubmitting(true);

      // 送信データの整形
      const submitData = {
        name: formData.name,
        description: formData.description || null,
        serialNumber: formData.serialNumber || null,
        assetTypeId: formData.assetTypeId,
        purchaseDate: new Date(formData.purchaseDate),
        warrantyExpiryDate: formData.warrantyExpiryDate
          ? new Date(formData.warrantyExpiryDate)
          : null,
        renewalDate: formData.renewalDate
          ? new Date(formData.renewalDate)
          : null,
        purchasePrice: formData.purchasePrice
          ? parseFloat(formData.purchasePrice)
          : null,
        currency: formData.currency,
        purchasedById: formData.purchasedById,
        currentUserId: formData.currentUserId,
        location: formData.location || null,
        notes: formData.notes || null,
        licenseKey: formData.licenseKey || null,
        tags: formData.tags || null,
        status: "active",
      };

      // APIリクエスト
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error("資産の保存に失敗しました");
      }

      // 成功時の処理
      await response.json();
      router.push("/");
    } catch (err) {
      console.error("保存エラー:", err);
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 以下はJSXの部分なので省略（変更なし）

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="mr-4 p-2 rounded-full hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">新規資産登録</h1>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md flex items-center hover:bg-gray-50"
            >
              <X className="w-4 h-4 mr-2" />
              キャンセル
            </Link>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting || loading}
              onClick={handleSubmit}
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? "保存中..." : "保存"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center py-10">
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
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本情報セクション */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">
                  基本情報
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      資産名 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="assetTypeId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      資産タイプ <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="assetTypeId"
                        name="assetTypeId"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.assetTypeId}
                        onChange={handleChange}
                      >
                        <option value="">選択してください</option>
                        {assetTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name === "hardware"
                              ? "ハードウェア"
                              : type.name === "software"
                                ? "ソフトウェア"
                                : type.name === "subscription"
                                  ? "サブスクリプション"
                                  : type.name === "domain"
                                    ? "ドメイン"
                                    : type.name === "ssl_certificate"
                                      ? "SSL証明書"
                                      : type.name === "rental"
                                        ? "レンタル品"
                                        : type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="serialNumber"
                      className="block text-sm font-medium text-gray-700"
                    >
                      シリアル番号 / ID
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="serialNumber"
                        id="serialNumber"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.serialNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="tags"
                      className="block text-sm font-medium text-gray-700"
                    >
                      タグ（カンマ区切り）
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="tags"
                        id="tags"
                        placeholder="PC, 開発用, 東京オフィス"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.tags}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      説明
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 購入・契約情報セクション */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">
                  購入・契約情報
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="purchaseDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      購入日 / 契約日 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="purchaseDate"
                        id="purchaseDate"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {showField("warrantyExpiryDate") && (
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="warrantyExpiryDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        保証期限
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="warrantyExpiryDate"
                          id="warrantyExpiryDate"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={formData.warrantyExpiryDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  {showField("renewalDate") && (
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="renewalDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        更新日 / 返却日
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="renewalDate"
                          id="renewalDate"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={formData.renewalDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="purchasePrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      購入価格 / 契約金額
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="purchasePrice"
                        id="purchasePrice"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.purchasePrice}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-gray-700"
                    >
                      通貨
                    </label>
                    <div className="mt-1">
                      <select
                        id="currency"
                        name="currency"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.currency}
                        onChange={handleChange}
                      >
                        <option value="JPY">JPY</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>

                  {showField("licenseKey") && (
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="licenseKey"
                        className="block text-sm font-medium text-gray-700"
                      >
                        ライセンスキー
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="licenseKey"
                          id="licenseKey"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          value={formData.licenseKey}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 担当者情報セクション */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">
                  担当者情報
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="purchasedById"
                      className="block text-sm font-medium text-gray-700"
                    >
                      購入者 / 契約者 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="purchasedById"
                        name="purchasedById"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.purchasedById}
                        onChange={handleChange}
                      >
                        <option value="">選択してください</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="currentUserId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      使用者 / 管理者 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="currentUserId"
                        name="currentUserId"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.currentUserId}
                        onChange={handleChange}
                      >
                        <option value="">選択してください</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      保管場所 / 使用場所
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="location"
                        id="location"
                        placeholder="東京オフィス3F"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 備考セクション */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">
                  備考
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700"
                    >
                      備考・メモ
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="資産に関する追加情報やメモを入力してください"
                        value={formData.notes}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 送信ボタン */}
              <div className="pt-5">
                <div className="flex justify-end">
                  <Link
                    href="/"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    キャンセル
                  </Link>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
