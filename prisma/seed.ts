import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ユーザー作成
  const user1 = await prisma.user.upsert({
    where: { email: "yamada@example.com" },
    update: {},
    create: {
      name: "山田太郎",
      email: "yamada@example.com",
      role: "buyer",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "sato@example.com" },
    update: {},
    create: {
      name: "佐藤花子",
      email: "sato@example.com",
      role: "user",
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "suzuki@example.com" },
    update: {},
    create: {
      name: "鈴木一郎",
      email: "suzuki@example.com",
      role: "user",
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: "it@example.com" },
    update: {},
    create: {
      name: "IT部門",
      email: "it@example.com",
      role: "admin",
    },
  });

  // 資産タイプ作成
  const hardwareType = await prisma.assetType.upsert({
    where: { name: "hardware" },
    update: {},
    create: {
      name: "hardware",
      description: "ハードウェア（PC、サーバー、周辺機器など）",
      defaultDepreciationPeriod: 36, // 3年
    },
  });

  const softwareType = await prisma.assetType.upsert({
    where: { name: "software" },
    update: {},
    create: {
      name: "software",
      description: "ソフトウェア（買い切り型ライセンス）",
    },
  });

  const subscriptionType = await prisma.assetType.upsert({
    where: { name: "subscription" },
    update: {},
    create: {
      name: "subscription",
      description:
        "サブスクリプション（定期的な更新が必要なソフトウェアやサービス）",
    },
  });

  const domainType = await prisma.assetType.upsert({
    where: { name: "domain" },
    update: {},
    create: {
      name: "domain",
      description: "ドメイン名（年間契約）",
    },
  });

  const sslType = await prisma.assetType.upsert({
    where: { name: "ssl_certificate" },
    update: {},
    create: {
      name: "ssl_certificate",
      description: "SSL証明書",
    },
  });

  const rentalType = await prisma.assetType.upsert({
    where: { name: "rental" },
    update: {},
    create: {
      name: "rental",
      description: "レンタル品（期限付きの機器など）",
    },
  });

  // 資産サンプルデータ作成
  const macbook = await prisma.asset.create({
    data: {
      name: "開発用MacBook Pro",
      description: "開発チーム用のMacBook Pro",
      serialNumber: "FVFXC2JQXXXXXX",
      assetTypeId: hardwareType.id,
      purchaseDate: new Date("2023-01-15"),
      warrantyExpiryDate: new Date("2025-01-15"),
      purchasePrice: 240000,
      currency: "JPY",
      purchasedById: user1.id,
      currentUserId: user2.id,
      status: "active",
      location: "東京オフィス",
      tags: "PC,開発用,Apple",
    },
  });

  const adobeCC = await prisma.asset.create({
    data: {
      name: "Adobe Creative Cloud",
      description: "デザイナー用のAdobe CC",
      serialNumber: "ADBE-1234-5678",
      assetTypeId: subscriptionType.id,
      purchaseDate: new Date("2023-05-10"),
      renewalDate: new Date("2024-05-10"),
      purchasePrice: 69800,
      currency: "JPY",
      purchasedById: user4.id,
      currentUserId: user3.id,
      status: "active",
      licenseKey: "XXXX-YYYY-ZZZZ",
      tags: "デザイン,ソフトウェア,Adobe",
    },
  });

  const domain = await prisma.asset.create({
    data: {
      name: "example.com",
      description: "会社Webサイト用ドメイン",
      assetTypeId: domainType.id,
      purchaseDate: new Date("2022-03-20"),
      renewalDate: new Date("2025-03-20"),
      purchasePrice: 2000,
      currency: "JPY",
      purchasedById: user4.id,
      currentUserId: user4.id,
      status: "active",
      tags: "ドメイン,Web",
    },
  });

  const ssl = await prisma.asset.create({
    data: {
      name: "SSL証明書 (example.com)",
      description: "会社WebサイトのSSL証明書",
      serialNumber: "SSL-9876-5432",
      assetTypeId: sslType.id,
      purchaseDate: new Date("2023-09-05"),
      renewalDate: new Date("2024-09-05"),
      purchasePrice: 15000,
      currency: "JPY",
      purchasedById: user4.id,
      currentUserId: user4.id,
      status: "active",
      tags: "SSL,Web,セキュリティ",
    },
  });

  const rentalPC = await prisma.asset.create({
    data: {
      name: "レンタルPC (営業部)",
      description: "営業部用のレンタルノートPC",
      serialNumber: "LN-5678",
      assetTypeId: rentalType.id,
      purchaseDate: new Date("2023-06-01"),
      renewalDate: new Date("2024-06-01"),
      purchasePrice: 8000,
      currency: "JPY",
      purchasedById: user1.id,
      currentUserId: user3.id,
      status: "active",
      location: "大阪オフィス",
      tags: "PC,レンタル,営業",
    },
  });

  // 通知ルール作成
  const rule1 = await prisma.notificationRule.create({
    data: {
      assetType: "hardware",
      eventType: "warranty_expiry",
      daysInAdvance: 30,
      notifyUsers: `${user4.id}`,
      emailEnabled: true,
      appEnabled: true,
      active: true,
    },
  });

  const rule2 = await prisma.notificationRule.create({
    data: {
      assetType: "subscription",
      eventType: "renewal_due",
      daysInAdvance: 14,
      notifyUsers: `${user1.id},${user4.id}`,
      emailEnabled: true,
      appEnabled: true,
      active: true,
    },
  });

  console.log({ user1, user2, user3, user4 });
  console.log({
    hardwareType,
    softwareType,
    subscriptionType,
    domainType,
    sslType,
    rentalType,
  });
  console.log({ macbook, adobeCC, domain, ssl, rentalPC });
  console.log({ rule1, rule2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
