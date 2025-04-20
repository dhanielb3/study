import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body = await req.json()

  await prisma.trophs.deleteMany({
    where: {
      studyId: body.filter?.where?.id,
    },
  });

  const study = await prisma.study.delete({
    where: body.filter?.where,
  })

  if (!study?.userId) {
    return new Response(JSON.stringify({ data: study }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } else {
    return new Response(JSON.stringify({ user: {} }), {
      status: 404, // ou 200, se você quiser tratar "não encontrado" de forma mais suave
      headers: { "Content-Type": "application/json" }
    })
  }
}
