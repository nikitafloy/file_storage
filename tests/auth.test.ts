import request from "supertest";
import { app, server } from "../express";

describe("auth controller", () => {
  beforeAll(async () => {
    await prisma.file.deleteMany();
    await prisma.userSessions.deleteMany();
    await prisma.user.deleteMany();
  });

  test("signup should return 204 and user should be exist", async () => {
    const email = "nikita@mail.ru";
    const password = "password";

    await request(app)
      .post("/auth/signup")
      .send({ id: email, password })
      .expect(204);

    const user = await prisma.user.findFirst({
      where: { id: email },
    });

    expect(user!.id).toBe(email);
  });

  afterAll(() => {
    server.close();
  });
});
