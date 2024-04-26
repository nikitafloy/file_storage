export class FileRepository {
  static async create(
    userId: number,
    name: string,
    ext: string,
    mime_type: string,
    size: number,
  ) {
    await prisma.file.create({
      data: {
        userId,
        name,
        ext,
        mime_type,
        size,
      },
    });
  }

  static async update(
    id: number,
    name: string,
    ext: string,
    mime_type: string,
    size: number,
  ) {
    await prisma.file.update({
      where: { id },
      data: {
        name,
        ext,
        mime_type,
        size,
      },
    });
  }

  static async getFile(id: number, userId: number) {
    const file = await prisma.file.findFirst({
      where: { id, userId },
    });

    return file;
  }

  static async getList(userId: number, list_size: number, page: number) {
    const list = await prisma.file.findMany({
      where: { userId },
      skip: list_size * (page - 1),
      take: list_size,
    });

    return list;
  }
}
