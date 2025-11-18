"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
const client_1 = require("@prisma/client");
// Global singleton Prisma client
let prisma = null;
function getDb() {
    if (!prisma) {
        prisma = new client_1.PrismaClient({
            // Prisma will automatically use DATABASE_URL from environment
            log: ['query', 'info', 'warn', 'error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        });
    }
    return prisma;
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
    }
    process.exit(0);
});
