import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
	const now = new Date();
	const day = now.getUTCDay();
	const diffToMonday = (day + 6) % 7;
	const body = await req.json()

	const startOfWeekUTC = new Date(Date.UTC(
		now.getUTCFullYear(),
		now.getUTCMonth(),
		now.getUTCDate() - diffToMonday,
		0, 0, 0, 0
	));

	const studyRecords = await prisma.study.findMany({
		where: {
            userId: {
				equals: body.email,
			},
			date: {
				gte: startOfWeekUTC,
			},
		},
	});

	const totalCorrects = studyRecords.reduce((sum, item) => sum + item.certain, 0);
	const totalWrongs = studyRecords.reduce((sum, item) => sum + item.errors, 0);
	const totalTime = studyRecords.reduce((sum, item) => sum + item.time, 0);

	return new Response(JSON.stringify({
		certain: totalCorrects,
		errors: totalWrongs,
		time: totalTime,
	}), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
