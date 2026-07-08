require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserData() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: 150002 },
      include: {
        cards: true,
        journals: true,
        goals: true
      }
    });
    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserData();
