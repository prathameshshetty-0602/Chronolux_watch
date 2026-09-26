import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: npm run admin:promote -- account@example.com");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL must point to the intended database.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { email: true, role: true },
  });
  console.log("Granted " + user.role + " access to " + user.email + ".");
} catch {
  console.error("No account with that email exists. Create an account first.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
