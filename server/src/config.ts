export const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET!;

if (!JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET est manquant. Définissez-le dans .env et sur Render.');
}
