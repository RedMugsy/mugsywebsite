"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
const client_1 = require("@prisma/client");
let prisma = null;
function getDb() {
    if (!prisma)
        prisma = new client_1.PrismaClient();
    return prisma;
}
