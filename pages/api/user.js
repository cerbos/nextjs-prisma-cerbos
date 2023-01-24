import { getLoginSession } from '../../lib/auth'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

export default async function user(req, res) {
  try {
    const session = await getLoginSession(req)
    const user = await prisma.user.findUnique({
      where: { username: session.username },
    });
    if (!user) {
      throw Error("Not found");
    }

    res.status(200).json({ user })
  } catch (error) {
    console.error(error)
    res.status(500).end('Authentication token is invalid, please log in')
  }
}
