import request from "supertest";
import "../prisma";
import { app, server } from "../express";
import { createTestUser } from "./helpers";
import FormData from "form-data";
import fs from "node:fs";
import path from "node:path";
import {
  MULTER_DESTINATION_FOLDER,
  MULTER_MAX_FILE_NAME_LENGTH,
} from "../constants";
import { User, File } from "@prisma/client";

describe("file controller", () => {
  const email = "nikita_file@mail.ru";
  const password = "password";

  let accessToken: string;
  let user: User | null;
  let file: File | null;

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

  test("/list should return right files length for new user", async () => {
    const list = await request(app)
      .get("/file/list")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(list.body.message.files.length).toBe(0);
  });

  test("should return a file with a name shorter than the original one after /upload", async () => {
    const fileName =
      "this_file_should_have_very_big_name_very_very_trust_me_it_is_very_big_name_of_the_file_may_be_bigger_that_any_files_in_this_repository.txt";
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

    user = await prisma.user.findFirst({
      where: { id: email },
    });

    if (!user) {
      fail("User was not found");
    }

    const file = await prisma.file.findFirst({
      where: { userId: user.userId },
    });

    if (!file) {
      fail("File was not found");
    }

    expect(file.name).toContain(fileName.slice(0, MULTER_MAX_FILE_NAME_LENGTH));
  });

  test("/download/:id should return downloaded file", async () => {
    if (!user) {
      fail("User was not found");
    }

    file = await prisma.file.findFirst({
      where: { userId: user.userId },
    });

    if (!file) {
      fail("File was not found");
    }

    await request(app)
      .get(`/file/download/${file.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect((res) => {
        const fileName = "lorem ipsum";

        const fileData = fs.readFileSync(
          path.join(__dirname, "files", fileName),
        );

        expect(Buffer.from(res.body).length).toBe(fileData.length);
        expect(res.status).toBe(200);
      });
  });

  test("/:id should return info about the file", async () => {
    if (!user) {
      fail("User was not found");
    }

    if (!file) {
      fail("File was not found");
    }

    const res = await request(app)
      .get(`/file/${file.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.message.file).toBeTruthy();
  });

  test("/update/:id should return 204 and successfully uploaded file", async () => {
    if (!user) {
      fail("User was not found");
    }

    if (!file) {
      fail("File was not found");
    }

    const fileName = "generated_text.txt";
    const fileData = fs.readFileSync(path.join(__dirname, "files", fileName));

    const formData = new FormData();
    formData.append("file", fileData, fileName);

    await request(app)
      .put(`/file/update/${file.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .set(
        "Content-Type",
        `multipart/form-data; boundary=${formData.getBoundary()}`,
      )
      .send(formData.getBuffer())
      .expect(204);

    const updatedFile = await prisma.file.findFirst({
      where: { userId: user.userId },
    });

    if (!updatedFile) {
      fail("Updated file was not found");
    }

    expect(updatedFile.ext).toBe("txt");
  });

  test("/delete/:id should delete the file and return 204", async () => {
    if (!user) {
      fail("User was not found");
    }

    if (!file) {
      fail("File was not found");
    }

    await request(app)
      .delete(`/file/delete/${file.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(204);

    const updatedFile = await prisma.file.findFirst({
      where: { userId: user.userId },
    });

    expect(updatedFile).toBeNull();
  });

  afterAll(() => {
    server.close();
  });
});
