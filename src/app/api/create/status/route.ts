import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();
  const dados = body.dados;

  if (!dados?.userId || !dados?.status) {
    return new Response(JSON.stringify({ error: "userId e status são obrigatórios" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const status = await prisma.status.upsert({
    where: { userId: dados.userId },
    update: { status: dados.status },
    create: {
      userId: dados.userId,
      status: dados.status,
    },
  });

  return new Response(JSON.stringify({ data: status }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}