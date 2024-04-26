import bcrypt from "bcrypt";
import {
  UserRepository,
  UserSessionsRepository,
} from "../../../prisma/repositories";
import {
  createAccessToken,
  createRefreshToken,
  decodeToken,
  verifyRefreshToken,
} from "../../../common";

export async function signIn(id: string, password: string, deviceId: string) {
  const user = await UserRepository.getById(id);
  if (!user) {
    throw new Error("User not found");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error("Passwords do not match");
  }

  const { userId } = user;

  const session = await UserSessionsRepository.create(userId, deviceId);
  if (!session) {
    throw new Error("User with this session already exists");
  }

  const tokenPayload = { userId, session: session.id };

  const accessToken = createAccessToken(tokenPayload);
  const refreshToken = createRefreshToken(tokenPayload);

  return { accessToken, refreshToken };
}

export async function updateToken(refreshToken: string) {
  try {
    verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new Error("Invalid token");
  }

  const { exp, iat, ...tokenPayload } = decodeToken(refreshToken);
  if (!iat) {
    throw new Error("User iat is not provided");
  }

  const session = await UserSessionsRepository.getActive(
    tokenPayload.session,
    iat,
  );

  if (!session) {
    throw new Error("User with this session is not exists or expired");
  }

  const accessToken = createAccessToken(tokenPayload);

  return accessToken;
}

export async function signUp(id: string, password: string) {
  const user = await UserRepository.getById(id);
  if (user) {
    throw new Error("User already exists");
  }

  await UserRepository.create(id, await bcrypt.hash(password, 10));
}

export async function logout(session: number) {
  await UserSessionsRepository.update(session, new Date());
}
