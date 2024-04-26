import request from "supertest";
import { app, server } from "../express";
import { createTestUser } from "./helpers";

describe("user controller", () => {
  const email = "nikita@mail.ru";
  const password = "password";

  let accessToken: string;

  beforeAll(async () => {
    await prisma.userSessions.deleteMany();
    await prisma.user.deleteMany();

    const testUserTokens = await createTestUser(email, password);

    accessToken = testUserTokens.accessToken;
  });

  test("info should return userId", async () => {
    const res = await request(app)
      .get("/user/info")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const user = await prisma.user.findFirst({
      where: { id: email },
    });

    if (!user) {
      fail("User was not found");
    }

    expect(res.body.message.userId).toBe(user.userId);
  });

  afterAll(() => {
    server.close();
  });
});
