import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 資産タイプ一覧取得
export async function GET() {
  try {
    const assetTypes = await prisma.assetType.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(assetTypes);
  } catch (error) {
    console.error("Error fetching asset types:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset types" },
      { status: 500 },
    );
  }
}
