export class UserSessionsRepository {
  static async create(userId: number, deviceId: string) {
    try {
      const session = await prisma.userSessions.create({
        data: { userId, deviceId },
      });

      return session;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  static async update(id: number, lastLogoutAt: Date) {
    await prisma.userSessions.update({
      where: {
        id,
      },
      data: {
        lastLogoutAt,
      },
    });
  }

  static async getActive(id: number, iat: number) {
    const session = await prisma.userSessions.findFirst({
      where: {
        id,
        OR: [
          { lastLogoutAt: null },
          { lastLogoutAt: { lte: new Date(iat * 1000) } },
        ],
      },
    });

    return session;
  }
}
