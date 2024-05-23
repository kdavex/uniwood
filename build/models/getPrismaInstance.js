"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
class GetPrismaInstance {
    static getPrismaInstance() {
        return this.prismaInstance;
    }
}
// static prismaInstance = new PrismaClient();
GetPrismaInstance.myString = "Hello World!";
GetPrismaInstance.prismaInstance = new client_1.PrismaClient();
console.log({ prisma: GetPrismaInstance.getPrismaInstance() });
console.log("Hello World!");
