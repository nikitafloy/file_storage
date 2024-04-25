import request from "supertest";
import { app, server } from "../express";

describe("auth controller", () => {
  beforeAll(async () => {
    await prisma.file.deleteMany();
    await prisma.userSessions.deleteMany();
    await prisma.user.deleteMany();
  });

  test("signup should return 204 and user should be exist", async () => {
    await request(app)
      .post("/auth/signup")
      .send({
        id: "nikita@mail.ru",
        password: "password",
      })
      .expect(204);
  });

  afterAll(() => {
    server.close();
  });
});
