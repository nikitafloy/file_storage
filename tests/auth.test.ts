import request from "supertest";
import "../prisma";
import { app, server } from "../express";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";

describe("auth controller", () => {
  const email = "nikita_auth@mail.ru";
  const password = "password";

  let accessToken: string;
  let refreshToken: string;
  let userId: number;

  beforeAll(async () => {
    await prisma.file.deleteMany();
    await prisma.userSessions.deleteMany();
    await prisma.user.deleteMany();
  });

  test("/signup should return 204 and user should be exist", async () => {
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

  test("/signin should return 204 and accessToken, refreshToken should be exists", async () => {
    const result = await request(app)
      .post("/auth/signin")
      .send({ id: email, password, deviceId: v4() })
      .expect(200);

    accessToken = result.body.message.accessToken;
    refreshToken = result.body.message.refreshToken;

    expect(result.body.message.accessToken).toBeTruthy();
    expect(result.body.message.refreshToken).toBeTruthy();
  });

  test("/logout should return 400 for invalid access token", async () => {
    const session = await prisma.userSessions.findFirst({
      where: { userId },
    });

    const invalidAccessToken = jwt.sign(
      { userId, session: session?.id },
      process.env.JWT_SECRET_ACCESS as string,
      { expiresIn: -30 },
    );

    await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${invalidAccessToken}`)
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({
          success: false,
          message: "Token not verified",
        });
      });
  });

  test("/new_token should return 200 and new accessToken", async () => {
    const result = await request(app)
      .post("/auth/signin/new_token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    expect(result.body.accessToken).toBeTruthy();
  });

  test("/new_token should return 400 for expired refresh token", async () => {
    const session = await prisma.userSessions.findFirst({
      where: { userId },
    });

    const expiredRefreshToken = jwt.sign(
      { userId, session: session?.id },
      process.env.JWT_SECRET_REFRESH as string,
      { expiresIn: -30 },
    );

    const res = await request(app)
      .post("/auth/signin/new_token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken: expiredRefreshToken })
      .expect(400);

    expect(res.body.message).toBe("Invalid token");
  });

  test("/logout should return 204 and user session should have lastLogoutAt", async () => {
    await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(204);

    const session = await prisma.userSessions.findFirst({
      where: { userId },
    });

    expect(session?.lastLogoutAt).toBeTruthy();
  });

  test("/logout should return 400 error for user with invalid session", async () => {
    const expectedBody = {
      success: false,
      message: "User with this session is not exists or expired",
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

  test("should return 200 if user with two sessions tries to get access to /user/info from each session", async () => {
    const [firstSession, secondSession] = await Promise.all([
      request(app)
        .post("/auth/signin")
        .send({ id: email, password, deviceId: v4() })
        .expect(200),
      request(app)
        .post("/auth/signin")
        .send({ id: email, password, deviceId: v4() })
        .expect(200),
    ]);

    const firstSessionAccessToken = firstSession.body.message.accessToken;
    const secondSessionAccessToken = secondSession.body.message.accessToken;

    await Promise.all([
      request(app)
        .get("/user/info")
        .set("Authorization", `Bearer ${firstSessionAccessToken}`)
        .expect((res) => {
          expect(res.status).toBe(200);
        }),
      request(app)
        .get("/user/info")
        .set("Authorization", `Bearer ${secondSessionAccessToken}`)
        .expect((res) => {
          expect(res.status).toBe(200);
        }),
    ]);
  });

  test("should return 400, 200 for the user who made /logout of the first session", async () => {
    const [firstSession, secondSession] = await Promise.all([
      request(app)
        .post("/auth/signin")
        .send({ id: email, password, deviceId: v4() })
        .expect(200),
      request(app)
        .post("/auth/signin")
        .send({ id: email, password, deviceId: v4() })
        .expect(200),
    ]);

    const firstSessionAccessToken = firstSession.body.message.accessToken;
    const secondSessionAccessToken = secondSession.body.message.accessToken;

    await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${firstSessionAccessToken}`)
      .expect(204);

    await Promise.all([
      request(app)
        .get("/user/info")
        .set("Authorization", `Bearer ${firstSessionAccessToken}`)
        .expect((res) => {
          expect(res.status).toBe(400);
        }),
      request(app)
        .get("/user/info")
        .set("Authorization", `Bearer ${secondSessionAccessToken}`)
        .expect((res) => {
          expect(res.status).toBe(200);
        }),
    ]);
  });

  test("should return 400 for the user who made /logout and trying to /signin/new_token", async () => {
    const res = await request(app)
      .post("/auth/signin")
      .send({ id: email, password, deviceId: v4() })
      .expect(200);

    const accessToken = res.body.message.accessToken;
    const refreshToken = res.body.message.accessToken;

    await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(204);

    await request(app)
      .post("/auth/signin/new_token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(400);
  });

  afterAll(() => {
    server.close();
  });
});
