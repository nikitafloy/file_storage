import { v4 } from "uuid";
import * as component from "../express/routers/auth/component";

export async function createTestUser(id: string, password: string) {
  await component.signUp(id, password);

  const tokens = await component.signIn(id, password, v4());

  return tokens;
}
