// scripts/check-notifications.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // 通知の生成APIを内部から呼び出す
    const response = await fetch(
      "http://localhost:3000/api/notifications/generate",
      {
        method: "POST",
      },
    );

    const result = await response.json();
    console.log(`通知生成結果: ${result.count}件の通知が生成されました`);

    // 生成した通知に基づいてメール送信などの処理を実行
    // ...
  } catch (error) {
    console.error("通知生成中にエラーが発生しました:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
