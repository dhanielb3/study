import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body = await req.json()
  const dados = body.dados

  const user = await prisma.user.create({
    data: {
      email: dados.email,
      name: dados.name,
      image: dados.foto,
      crown: 0,
    },
  })

  await prisma.trophs.create({
    data: {
      trophs: 0,
      date: new Date(),
      userId: dados.email
    },
  })

  if (user?.email) {
    return new Response(JSON.stringify({ user: {
      data: {
        email: dados.email,
        name: dados.name,
        image: dados.foto,
      },
    } }), {
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
