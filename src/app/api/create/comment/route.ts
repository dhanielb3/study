import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const body = await req.json()
  const dados = body.dados


  const comment = await prisma.comments.create({
    data: {
      studyId:  dados.studyId,
      userId:  dados.userId,
      text: dados.text,
      userName: dados.userName,
      date: new Date(),
    },
  })

    return new Response(JSON.stringify({ data: comment }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  
}
