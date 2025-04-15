"use client";

import { useState, useEffect } from "react";
import { Bell, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  NotificationRule,
  User,
  AssetTypeOption,
  EventTypeOption,
} from "@/types";

export default function NotificationSettings() {
  const [notificationRules, setNotificationRules] = useState<
    NotificationRule[]
  >([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 編集中のルール
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  // 新しいルール用の空テンプレート
  const emptyRule: Omit<NotificationRule, "id" | "createdAt" | "updatedAt"> & {
    id: null;
  } = {
    id: null,
    assetType: "",
    eventType: "",
    daysInAdvance: 14,
    notifyUsers: "",
    emailEnabled: true,
    appEnabled: true,
    active: true,
  };

  // イベントタイプリスト
  const eventTypes: EventTypeOption[] = [
    { value: "warranty_expiry", label: "保証期限切れ" },
    { value: "renewal_due", label: "更新期限" },
    { value: "return_due", label: "返却期限" },
    { value: "depreciation_complete", label: "償却完了" },
  ];

  // 資産タイプリスト
  const assetTypes: AssetTypeOption[] = [
    { value: "all", label: "すべての資産タイプ" },
    { value: "hardware", label: "ハードウェア" },
    { value: "software", label: "ソフトウェア" },
    { value: "subscription", label: "サブスクリプション" },
    { value: "domain", label: "ドメイン" },
    { value: "ssl_certificate", label: "SSL証明書" },
    { value: "rental", label: "レンタル品" },
  ];

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 通知ルール取得
        const rulesRes = await fetch("/api/notification-rules");
        if (!rulesRes.ok) throw new Error("通知ルールの取得に失敗しました");
        const rulesData = await rulesRes.json();

        // ユーザーリスト取得
        const usersRes = await fetch("/api/users");
        if (!usersRes.ok) throw new Error("ユーザーリストの取得に失敗しました");
        const usersData = await usersRes.json();

        setNotificationRules(rulesData);
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

  // 通知ルールの追加
  const addRule = () => {
    setEditingRule({
      ...emptyRule,
      notifyUserIds: [],
    } as unknown as NotificationRule);
  };

  // 通知ルールの編集
  const editRule = (rule: NotificationRule) => {
    // 通知先ユーザーの文字列からユーザーID配列に変換
    const notifyUserIds = rule.notifyUsers.split(",").filter((id) => id.trim());

    setEditingRule({
      ...rule,
      notifyUserIds,
    });
  };

  // 通知ルールの保存
  const saveRule = async () => {
    if (!editingRule) return;

    // 必須フィールドの検証
    if (
      !editingRule.assetType ||
      !editingRule.eventType ||
      !editingRule.notifyUserIds ||
      editingRule.notifyUserIds.length === 0
    ) {
      alert("資産タイプ、イベントタイプ、通知先ユーザーは必須です。");
      return;
    }

    try {
      // 送信データの準備
      const submitData = {
        ...(editingRule.id ? { id: editingRule.id } : {}),
        assetType: editingRule.assetType,
        eventType: editingRule.eventType,
        daysInAdvance: parseInt(String(editingRule.daysInAdvance), 10),
        notifyUsers: editingRule.notifyUserIds.join(","),
        emailEnabled: editingRule.emailEnabled,
        appEnabled: editingRule.appEnabled,
        active: editingRule.active,
      };

      // APIリクエスト
      const method = editingRule.id ? "PUT" : "POST";
      const url = editingRule.id
        ? `/api/notification-rules/${editingRule.id}`
        : "/api/notification-rules";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error("通知ルールの保存に失敗しました");
      }

      // 成功時の処理
      const result = await response.json();

      // ルール一覧を更新
      setNotificationRules((prevRules) => {
        if (editingRule.id) {
          return prevRules.map((rule) =>
            rule.id === editingRule.id ? result : rule,
          );
        } else {
          return [...prevRules, result];
        }
      });

      // モーダルを閉じる
      setEditingRule(null);
    } catch (err) {
      console.error("保存エラー:", err);
      alert("通知ルールの保存中にエラーが発生しました。");
    }
  };

  // 通知ルールの削除
  const deleteRule = async (id: string) => {
    if (!confirm("この通知ルールを削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/notification-rules/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("通知ルールの削除に失敗しました");
      }

      // ルール一覧を更新
      setNotificationRules((prevRules) =>
        prevRules.filter((rule) => rule.id !== id),
      );

      // 編集中のルールが削除されたらモーダルを閉じる
      if (editingRule && editingRule.id === id) {
        setEditingRule(null);
      }
    } catch (err) {
      console.error("削除エラー:", err);
      alert("通知ルールの削除中にエラーが発生しました。");
    }
  };

  // チェックボックスの変更
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    ruleId: string,
  ) => {
    const updatedRules = notificationRules.map((rule) => {
      if (rule.id === ruleId) {
        return { ...rule, [field]: e.target.checked };
      }
      return rule;
    });

    setNotificationRules(updatedRules);
  };

  // 編集中のルールのフィールド変更
  const handleEditingRuleChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    if (!editingRule) return;

    setEditingRule({
      ...editingRule,
      [field]: value,
    });
  };

  // 通知先ユーザーの変更
  const handleUserSelection = (userId: string) => {
    if (!editingRule) return;

    const currentUserIds = editingRule.notifyUserIds || [];
    let newUserIds = [...currentUserIds];

    if (currentUserIds.includes(userId)) {
      // 選択解除
      newUserIds = currentUserIds.filter((id) => id !== userId);
    } else {
      // 選択
      newUserIds.push(userId);
    }

    setEditingRule({
      ...editingRule,
      notifyUserIds: newUserIds,
    });
  };

  // イベントタイプによって関連する資産タイプをフィルタリング
  const getRelevantAssetTypes = (eventType: string) => {
    switch (eventType) {
      case "warranty_expiry":
        return assetTypes.filter(
          (type) => type.value === "all" || type.value === "hardware",
        );
      case "renewal_due":
        return assetTypes.filter(
          (type) =>
            type.value === "all" ||
            ["subscription", "domain", "ssl_certificate"].includes(type.value),
        );
      case "return_due":
        return assetTypes.filter(
          (type) => type.value === "all" || type.value === "rental",
        );
      case "depreciation_complete":
        return assetTypes.filter(
          (type) => type.value === "all" || type.value === "hardware",
        );
      default:
        return assetTypes;
    }
  };

  // イベントタイプの表示名を取得
  const getEventTypeLabel = (value: string): string => {
    const event = eventTypes.find((type) => type.value === value);
    return event ? event.label : value;
  };

  // 資産タイプの表示名を取得
  const getAssetTypeLabel = (value: string): string => {
    const asset = assetTypes.find((type) => type.value === value);
    return asset ? asset.label : value;
  };

  // 通知先ユーザーの名前をカンマ区切りで取得
  const getUserNames = (userIdsString: string | undefined): string => {
    if (!userIdsString) return "";

    const userIds = userIdsString.split(",");
    return userIds
      .map((id: string) => {
        const user = users.find((u) => u.id === id);
        return user ? user.name : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">通知設定</h1>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
              onClick={addRule}
            >
              <Plus className="w-4 h-4 mr-2" />
              新規ルール作成
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
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <div className="px-6 py-5 flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  通知ルール
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      資産タイプ
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      イベント
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      通知タイミング
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
                      通知方法
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      状態
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
                  {notificationRules.length > 0 ? (
                    notificationRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getAssetTypeLabel(rule.assetType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getEventTypeLabel(rule.eventType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rule.daysInAdvance}日前
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getUserNames(rule.notifyUsers)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-4">
                            <div className="flex items-center">
                              <input
                                id={`email-${rule.id}`}
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={rule.emailEnabled}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    e,
                                    "emailEnabled",
                                    rule.id,
                                  )
                                }
                              />
                              <label
                                htmlFor={`email-${rule.id}`}
                                className="ml-2 text-sm text-gray-500"
                              >
                                メール
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id={`app-${rule.id}`}
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={rule.appEnabled}
                                onChange={(e) =>
                                  handleCheckboxChange(e, "appEnabled", rule.id)
                                }
                              />
                              <label
                                htmlFor={`app-${rule.id}`}
                                className="ml-2 text-sm text-gray-500"
                              >
                                アプリ
                              </label>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <input
                              id={`active-${rule.id}`}
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={rule.active}
                              onChange={(e) =>
                                handleCheckboxChange(e, "active", rule.id)
                              }
                            />
                            <label
                              htmlFor={`active-${rule.id}`}
                              className="ml-2 text-sm text-gray-500"
                            >
                              有効
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            onClick={() => editRule(rule)}
                          >
                            編集
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => deleteRule(rule.id)}
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        通知ルールがありません。「新規ルール作成」ボタンをクリックして追加してください。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 以下は変更なし */}

        {/* 通知設定の説明セクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
            通知について
          </h3>

          <div className="space-y-4 text-sm text-gray-500">
            <p>
              資産の期限が近づくと、設定したルールに基づいて通知が送信されます。
            </p>
            <p>以下のイベントに対して通知を設定できます：</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">保証期限切れ：</span>{" "}
                ハードウェアの保証期限が近づくと通知します。
              </li>
              <li>
                <span className="font-medium">更新期限：</span>{" "}
                サブスクリプション、ドメイン、SSL証明書などの更新期限が近づくと通知します。
              </li>
              <li>
                <span className="font-medium">返却期限：</span>{" "}
                レンタル品の返却期限が近づくと通知します。
              </li>
              <li>
                <span className="font-medium">償却完了：</span>{" "}
                資産の償却期間が完了すると通知します。
              </li>
            </ul>
            <p>
              通知は、指定された日数前に送信されます。複数の通知ルールを設定することで、同じイベントに対して異なるタイミングで複数の通知を設定することができます。
            </p>
          </div>
        </div>

        {/* 通知ルール編集モーダル */}
        {editingRule && (
          <div
            className="fixed inset-0 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              ></div>

              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3
                        className="text-lg leading-6 font-medium text-gray-900"
                        id="modal-title"
                      >
                        通知ルールの編集
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label
                            htmlFor="eventType"
                            className="block text-sm font-medium text-gray-700"
                          >
                            イベントタイプ{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="eventType"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingRule.eventType}
                            onChange={(e) =>
                              handleEditingRuleChange(
                                "eventType",
                                e.target.value,
                              )
                            }
                          >
                            <option value="">選択してください</option>
                            {eventTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="assetType"
                            className="block text-sm font-medium text-gray-700"
                          >
                            資産タイプ <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="assetType"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingRule.assetType}
                            onChange={(e) =>
                              handleEditingRuleChange(
                                "assetType",
                                e.target.value,
                              )
                            }
                            disabled={!editingRule.eventType}
                          >
                            <option value="">選択してください</option>
                            {editingRule.eventType &&
                              getRelevantAssetTypes(editingRule.eventType).map(
                                (type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ),
                              )}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="daysInAdvance"
                            className="block text-sm font-medium text-gray-700"
                          >
                            通知タイミング（日前）{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            id="daysInAdvance"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={editingRule.daysInAdvance}
                            min="1"
                            max="365"
                            onChange={(e) =>
                              handleEditingRuleChange(
                                "daysInAdvance",
                                parseInt(e.target.value, 10) || 1,
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            通知先ユーザー{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 max-h-48 overflow-y-auto border border-gray-300 rounded-md divide-y">
                            {users.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center px-3 py-2 hover:bg-gray-50"
                              >
                                <input
                                  id={`user-${user.id}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  checked={
                                    editingRule.notifyUserIds &&
                                    editingRule.notifyUserIds.includes(user.id)
                                  }
                                  onChange={() => handleUserSelection(user.id)}
                                />
                                <label
                                  htmlFor={`user-${user.id}`}
                                  className="ml-3 block text-sm text-gray-700"
                                >
                                  {user.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            通知方法
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <input
                                id="emailEnabled"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={editingRule.emailEnabled}
                                onChange={(e) =>
                                  handleEditingRuleChange(
                                    "emailEnabled",
                                    e.target.checked,
                                  )
                                }
                              />
                              <label
                                htmlFor="emailEnabled"
                                className="ml-2 text-sm text-gray-700"
                              >
                                メール通知
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="appEnabled"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={editingRule.appEnabled}
                                onChange={(e) =>
                                  handleEditingRuleChange(
                                    "appEnabled",
                                    e.target.checked,
                                  )
                                }
                              />
                              <label
                                htmlFor="appEnabled"
                                className="ml-2 text-sm text-gray-700"
                              >
                                アプリ内通知
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="active"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={editingRule.active}
                            onChange={(e) =>
                              handleEditingRuleChange(
                                "active",
                                e.target.checked,
                              )
                            }
                          />
                          <label
                            htmlFor="active"
                            className="ml-2 text-sm text-gray-700"
                          >
                            このルールを有効にする
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={saveRule}
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setEditingRule(null)}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
