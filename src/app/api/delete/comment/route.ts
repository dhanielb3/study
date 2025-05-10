import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body = await req.json()

  const comment = await prisma.comments.deleteMany({
    where: {
      id: body.filter?.where?.id,
    },
  });

  if (comment) {
    return new Response(JSON.stringify({ data: comment }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } else {
    return new Response(JSON.stringify({ data: {} }), {
      status: 404, // ou 200, se você quiser tratar "não encontrado" de forma mais suave
      headers: { "Content-Type": "application/json" }
    })
  }
}
