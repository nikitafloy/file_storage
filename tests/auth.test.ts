import request from "supertest";
import { app, server } from "../express";
import { uuid } from "uuidv4";

describe("auth controller", () => {
  const email = "nikita@mail.ru";
  const password = "password";

  let accessToken: string;
  let refreshToken: string;
  let userId: number;

  beforeAll(async () => {
    await prisma.file.deleteMany();
    await prisma.userSessions.deleteMany();
    await prisma.user.deleteMany();
  });

  test("signup should return 204 and user should be exist", async () => {
    await request(app)
      .post("/auth/signup")
      .send({ id: email, password })
      .expect(204);

    const user = await prisma.user.findFirst({
      where: { id: email },
    });

    if (!user) {
      fail("User was not found");
    }

    userId = user.userId;

    expect(user.id).toBe(email);
  });

  test("signin should return 204 and accessToken, refreshToken should be exists", async () => {
    const result = await request(app)
      .post("/auth/signin")
      .send({ id: email, password, deviceId: uuid() })
      .expect(200);

    accessToken = result.body.message.accessToken;
    refreshToken = result.body.message.refreshToken;

    expect(result.body.message.accessToken).toBeTruthy();
    expect(result.body.message.refreshToken).toBeTruthy();
  });

  test("new_token should return 200 and new accessToken", async () => {
    const result = await request(app)
      .post("/auth/signin/new_token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    expect(result.body.accessToken).toBeTruthy();
  });

  test("logout should return 204 and user session should have lastLogoutAt", async () => {
    await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(204);

    const session = await prisma.userSessions.findFirst({
      where: { userId },
    });

    expect(session?.lastLogoutAt).toBeTruthy();
  });

  test("logout should return 400 error for user with invalid session", async () => {
    const expectedBody = {
      success: false,
      message: "Token not verified",
    };

    await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect((res) => {
        expect(res.body).toStrictEqual(expectedBody);
      });

    await request(app)
      .post("/auth/signin/new_token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect((res) => {
        expect(res.body).toStrictEqual({
          success: false,
          message: "User with this session is not exists or expired",
        });
      });

    await request(app)
      .get("/user/info")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect((res) => {
        expect(res.body).toStrictEqual(expectedBody);
      });

    await request(app)
      .get("/file/list")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect((res) => {
        expect(res.body).toStrictEqual(expectedBody);
      });

    await request(app)
      .get("/file/download/1")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect((res) => {
        expect(res.body).toStrictEqual(expectedBody);
      });

    await request(app)
      .delete("/file/delete/1")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect((res) => {
        expect(res.body).toStrictEqual(expectedBody);
      });

    await request(app)
      .get("/file/1")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect((res) => {
        expect(res.body).toStrictEqual(expectedBody);
      });
  });

  afterAll(() => {
    server.close();
  });
});
