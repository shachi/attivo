// src/app/api/notifications/generate/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Asset, AssetType } from "@prisma/client";

const prisma = new PrismaClient();

// カスタムAsset型の定義（include.assetTypeを含む）
type AssetWithType = Asset & {
  assetType: AssetType;
  purchasedBy?: {
    id: string;
    name: string;
  };
};

// POST: 通知の自動生成
export async function POST() {
  try {
    // 通知ルールを取得
    const rules = await prisma.notificationRule.findMany({
      where: {
        active: true,
      },
    });

    const today = new Date();
    const generatedNotifications = [];

    // 各ルールに対して通知を生成
    for (const rule of rules) {
      // ルールに基づいて資産を検索
      let assets: AssetWithType[] = [];
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + rule.daysInAdvance);

      switch (rule.eventType) {
        case "warranty_expiry":
          // 保証期限が近づいている資産を検索
          assets = await prisma.asset.findMany({
            where: {
              assetType: {
                name: rule.assetType !== "all" ? rule.assetType : undefined,
              },
              warrantyExpiryDate: {
                // 指定した日数後の日付 +/- 12時間以内に期限が来る資産
                gte: new Date(targetDate.getTime() - 12 * 60 * 60 * 1000),
                lte: new Date(targetDate.getTime() + 12 * 60 * 60 * 1000),
              },
              status: "active",
            },
            include: {
              assetType: true,
            },
          });
          break;

        case "renewal_due":
          // 更新期限が近づいている資産を検索
          assets = await prisma.asset.findMany({
            where: {
              assetType: {
                name: rule.assetType !== "all" ? rule.assetType : undefined,
              },
              renewalDate: {
                gte: new Date(targetDate.getTime() - 12 * 60 * 60 * 1000),
                lte: new Date(targetDate.getTime() + 12 * 60 * 60 * 1000),
              },
              status: "active",
            },
            include: {
              assetType: true,
            },
          });
          break;

        case "return_due":
          // 返却期限が近づいているレンタル資産を検索
          assets = await prisma.asset.findMany({
            where: {
              assetType: {
                name: "rental",
              },
              renewalDate: {
                gte: new Date(targetDate.getTime() - 12 * 60 * 60 * 1000),
                lte: new Date(targetDate.getTime() + 12 * 60 * 60 * 1000),
              },
              status: "active",
            },
            include: {
              assetType: true,
            },
          });
          break;

        case "depreciation_complete":
          // 償却期間が完了する資産を検索（ここでは簡単な例として実装）
          // 実際のアプリケーションでは、より複雑な償却計算が必要かもしれません
          assets = await prisma.asset.findMany({
            where: {
              assetType: {
                name: rule.assetType !== "all" ? rule.assetType : undefined,
              },
              depreciationPeriod: {
                not: null,
              },
              status: "active",
            },
            include: {
              assetType: true,
              purchasedBy: true,
            },
          });

          // 購入日から償却期間を計算して、該当する資産だけをフィルタリング
          assets = assets.filter((asset) => {
            if (!asset.purchaseDate || !asset.depreciationPeriod) return false;

            const purchaseDate = new Date(asset.purchaseDate);
            const depreciationEndDate = new Date(purchaseDate);
            depreciationEndDate.setMonth(
              depreciationEndDate.getMonth() + asset.depreciationPeriod,
            );

            const diffTime = depreciationEndDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays === rule.daysInAdvance;
          });
          break;
      }

      // 通知対象のユーザーIDを取得
      const userIds = rule.notifyUsers.split(",").filter((id) => id.trim());

      // 各資産と各ユーザーに対して通知を生成
      for (const asset of assets) {
        for (const userId of userIds) {
          // 同じ資産とユーザーの組み合わせで、過去24時間以内に生成された同じタイプの通知がないか確認
          const existingNotification = await prisma.notification.findFirst({
            where: {
              assetId: asset.id,
              userId,
              type: rule.eventType,
              createdAt: {
                gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
              },
            },
          });

          if (existingNotification) {
            console.log(`通知は既に存在します: ${asset.name} to ${userId}`);
            continue;
          }

          // 通知タイトルとメッセージを生成
          let title = "";
          let message = "";

          switch (rule.eventType) {
            case "warranty_expiry":
              title = `保証期限まであと${rule.daysInAdvance}日: ${asset.name}`;
              message = `資産「${asset.name}」の保証期限が${rule.daysInAdvance}日後に切れます。`;
              break;

            case "renewal_due":
              title = `更新期限まであと${rule.daysInAdvance}日: ${asset.name}`;
              message = `資産「${asset.name}」の更新期限が${rule.daysInAdvance}日後に切れます。`;
              break;

            case "return_due":
              title = `返却期限まであと${rule.daysInAdvance}日: ${asset.name}`;
              message = `レンタル資産「${asset.name}」の返却期限が${rule.daysInAdvance}日後に切れます。`;
              break;

            case "depreciation_complete":
              title = `償却完了まであと${rule.daysInAdvance}日: ${asset.name}`;
              message = `資産「${asset.name}」の償却期間が${rule.daysInAdvance}日後に完了します。`;
              break;
          }

          // 通知を作成
          const notification = await prisma.notification.create({
            data: {
              assetId: asset.id,
              userId,
              type: rule.eventType,
              title,
              message,
              isRead: false,
              scheduledDate: targetDate,
              sentDate: today,
            },
          });

          generatedNotifications.push(notification);

          // TODO: 実際のアプリケーションでは、ここでメール送信などの処理を追加
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: generatedNotifications.length,
      notifications: generatedNotifications,
    });
  } catch (error) {
    console.error("Error generating notifications:", error);
    return NextResponse.json(
      { error: "Failed to generate notifications" },
      { status: 500 },
    );
  }
}
