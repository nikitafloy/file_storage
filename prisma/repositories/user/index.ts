import prisma from "../../index";

export class UserRepository {
  static async create(id: string, password: string) {
    await prisma.user.create({
      data: {
        id,
        password,
      },
    });
  }

  static async getById(id: string) {
    const user = await prisma.user.findFirst({ where: { id } });

    return user;
  }
}
