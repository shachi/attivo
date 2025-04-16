// src/app/users/[id]/edit/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Save, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function EditUser({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  // ユーザーデータ取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("ユーザーが見つかりませんでした");
          }
          throw new Error("ユーザーデータの取得に失敗しました");
        }

        const userData = await response.json();

        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "user",
        });

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 必須フィールドのバリデーション
    if (!formData.name || !formData.email) {
      alert("名前とメールアドレスは必須項目です。");
      return;
    }

    // Eメールの基本的な検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("有効なメールアドレスを入力してください。");
      return;
    }

    try {
      setSubmitting(true);

      // APIリクエスト
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ユーザーの更新に失敗しました");
      }

      // 成功時の処理
      await response.json();
      router.push(`/users/${id}`);
    } catch (err) {
      console.error("更新エラー:", err);
      setError(
        err instanceof Error ? err.message : "不明なエラーが発生しました",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <Link
              href={`/users/${id}`}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">ユーザー編集</h1>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/users/${id}`}
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

        {error && (
          <div
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">データを読み込み中...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">
                  ユーザー情報
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      名前 <span className="text-red-500">*</span>
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
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      役割 <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="role"
                        name="role"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="user">使用者</option>
                        <option value="buyer">購入者</option>
                        <option value="admin">管理者</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <Link
                    href={`/users/${id}`}
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
