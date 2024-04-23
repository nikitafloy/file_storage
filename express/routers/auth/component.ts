import prisma from "../../../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function signIn(id: string, password: string, deviceId: string) {
  const user = await prisma.user.findFirst({ where: { id } });
  if (!user) {
    throw new Error("User not found");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error("Passwords do not match");
  }

  const { userId } = user;

  const session = await prisma.userSessions
    .create({ data: { userId, deviceId } })
    .catch((err) => {
      console.error(err);
    });

  if (!session) {
    throw new Error("User with this session already exists");
  }

  const tokenPayload = { userId, session: session.id };

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET_ACCESS as string,
    { expiresIn: "10m" },
  );

  const refreshToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET_REFRESH as string,
  );

  return { accessToken, refreshToken };
}

export async function updateToken(refreshToken: string) {
  try {
    jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH as string,
    ) as jwt.JwtPayload;
  } catch (err) {
    throw new Error("Invalid token");
  }

  const { exp, iat, ...tokenPayload } = jwt.decode(
    refreshToken,
  ) as jwt.JwtPayload;

  if (!iat) {
    throw new Error("User iat is not provided");
  }

  const session = await prisma.userSessions.findFirst({
    where: {
      id: tokenPayload.session,
      OR: [
        { lastLogoutAt: null },
        { lastLogoutAt: { lte: new Date(iat * 1000) } },
      ],
    },
  });

  if (!session) {
    throw new Error("User with this session is not exists or expired");
  }

  const accessToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET_ACCESS as string,
    { expiresIn: "10m" },
  );

  return accessToken;
}

export async function signUp(id: string, password: string) {
  const user = await prisma.user.findFirst({ where: { id } });
  if (user) {
    throw new Error("User already exists");
  }

  await prisma.user.create({
    data: {
      id,
      password: await bcrypt.hash(password, 10),
    },
  });
}

export async function logout(session: number) {
  await prisma.userSessions.update({
    where: {
      id: session,
    },
    data: {
      lastLogoutAt: new Date(),
    },
  });
}
