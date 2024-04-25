import * as component from "../express/routers/auth/component";
import { uuid } from "uuidv4";

export async function createTestUser(id: string, password: string) {
  await component.signUp(id, password);

  const tokens = await component.signIn(id, password, uuid());

  return tokens;
}
