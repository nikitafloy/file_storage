export async function getFile(id: number, userId: number) {
  const file = await prisma.file.findFirst({
    where: { id, userId },
  });

  return file;
}
