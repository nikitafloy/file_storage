import request from "supertest";
import { app, server } from "../express";
import { createTestUser } from "./helpers";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";
import { MULTER_DESTINATION_FOLDER } from "../constants";

describe("file controller", () => {
  const email = "nikita@mail.ru";
  const password = "password";

  let accessToken: string;

  beforeAll(async () => {
    await prisma.file.deleteMany();
    await prisma.userSessions.deleteMany();
    await prisma.user.deleteMany();

    const files = await fs.promises.readdir(MULTER_DESTINATION_FOLDER);

    for await (const file of files) {
      await fs.promises.unlink(path.join(MULTER_DESTINATION_FOLDER, file));
    }

    const testUserTokens = await createTestUser(email, password);

    accessToken = testUserTokens.accessToken;
  });

  test("list should return right files length for new user", async () => {
    const list = await request(app)
      .get("/file/list")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(list.body.message.files.length).toBe(0);
  });

  test("upload should return success uploaded file", async () => {
    const fileName = "lorem ipsum";

    const fileData = fs.readFileSync(path.join(__dirname, "files", fileName));

    const formData = new FormData();
    formData.append("file", fileData, fileName);

    await request(app)
      .post("/file/upload")
      .set("Authorization", `Bearer ${accessToken}`)
      .set(
        "Content-Type",
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer())
      .expect(204);

    const user = await prisma.user.findFirst({
      where: { id: email },
    });

    if (!user) {
      fail("User was not found");
    }

    const count = await prisma.file.count({
      where: { userId: user.userId },
    });

    expect(count).toBe(1);
  });

  afterAll(() => {
    server.close();
  });
});
