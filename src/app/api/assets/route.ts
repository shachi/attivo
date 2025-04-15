import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 資産一覧取得
export async function GET(request: Request) {
  try {
    // URLクエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const assetType = searchParams.get("assetType") || "";
    const userId = searchParams.get("userId") || "";

    // 検索条件を構築（型アサーションを使用）
    const whereConditions: Prisma.AssetWhereInput = {};

    // 検索条件: 検索語句
    if (search) {
      whereConditions.OR = [
        { name: { contains: search } },
        { serialNumber: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // 検索条件: 資産タイプ
    if (assetType && assetType !== "all") {
      whereConditions.assetType = {
        name: assetType,
      };
    }

    // 検索条件: ユーザーID (購入者または使用者)
    if (userId && userId !== "all") {
      // 既にOR条件がある場合は新しい配列を作成
      const orConditions = Array.isArray(whereConditions.OR)
        ? [...whereConditions.OR]
        : [];

      // 新しいOR条件を追加
      orConditions.push({ purchasedById: userId }, { currentUserId: userId });

      whereConditions.OR = orConditions;
    }

    // 資産一覧を取得
    const assets = await prisma.asset.findMany({
      where: whereConditions,
      include: {
        assetType: true,
        purchasedBy: true,
        currentUser: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // 資産ごとの期限日数を計算
    const assetsWithDaysLeft = assets.map((asset) => {
      const today = new Date();
      let expiryDate = null;

      if (asset.warrantyExpiryDate) {
        expiryDate = asset.warrantyExpiryDate;
      } else if (asset.renewalDate) {
        expiryDate = asset.renewalDate;
      }

      let daysUntilExpiry = null;
      if (expiryDate) {
        const diffTime = expiryDate.getTime() - today.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...asset,
        daysUntilExpiry,
      };
    });

    return NextResponse.json(assetsWithDaysLeft);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 },
    );
  }
}

// POST: 新規資産作成
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Prismaを使って資産を作成
    const asset = await prisma.asset.create({
      data,
      include: {
        assetType: true,
        purchasedBy: true,
        currentUser: true,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 },
    );
  }
}
