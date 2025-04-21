import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body: any = await req.json()

  const result = await prisma.status.findMany({
    where: body.filter?.where || {},
  })

  if (result) {
    return new Response(JSON.stringify({ data: result }), {
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
