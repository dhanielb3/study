// pages/api/findTrophs.ts
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export async function POST(req: NextApiRequest, res: NextApiResponse) {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);

	const result = await prisma.trophs.findMany({
		where: {
			date: {},
		},
		orderBy: {
			trophs: "desc",
		},
		include: {
			user: true,
		},
	});

	return new Response(JSON.stringify({ data: result }));
}
