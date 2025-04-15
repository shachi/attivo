import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: 特定の資産を取得
export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    const params = await context.params;
    const id = params.id;

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        assetType: true,
        purchasedBy: true,
        currentUser: true,
        documents: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 },
    );
  }
}

// PUT: 資産を更新
export async function PUT(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    const params = await context.params;
    const id = params.id;
    const data = await request.json();

    const asset = await prisma.asset.update({
      where: { id },
      data,
      include: {
        assetType: true,
        purchasedBy: true,
        currentUser: true,
        documents: true,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 },
    );
  }
}

// DELETE: 資産を削除
export async function DELETE(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    const params = await context.params;
    const id = params.id;

    await prisma.asset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
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
