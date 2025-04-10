"use client";

import Input from "@/components/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Player from "@/components/player";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

function limitText(text: string | undefined, maxLength: number = 15): string {
	if (!text) return "";
	return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

const options = {
	plugins: {
		legend: {
			position: "bottom",
		},
	},
	responsive: true,
	scales: {
		x: {
			stacked: true,
		},
		y: {
			stacked: true,
		},
	},
};

const labels = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

export default function Home() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [stats, setStats] = useState<{
		certain: number;
		errors: number;
		time: number;
	}>({ certain: 0, errors: 0, time: 0 });
	const [chartData, setChartData] = useState({
		labels,
		datasets: [
			{
				label: "Horas de estudo",
				data: [],
				backgroundColor: "rgb(255, 99, 132)",
			},
			{
				label: "Acertos",
				data: [],
				backgroundColor: "rgb(75, 192, 192)",
			},
			{
				label: "Erros",
				data: [],
				backgroundColor: "rgb(53, 162, 235)",
			},
		],
	});
	const [lastStudy, setLastStudy] = useState<{
		id: string;
		userId: string;
		title: string;
		photo: string;
		certain: number;
		errors: number;
		time: string;
		description: string;
		date: string;
		user: {
			id: string;
			userId: string;
			name: string;
			image: string;
			email: string;
		};
		//@ts-ignore
	}>({});
	const [trophs, setTrophs] = useState<
		{
			id: string;
			userId: string;
			date: string | null;
			trophs: number;
			user: {
				id: string;
				name: string;
				email: string;
				image: string;
			};
		}[]
	>([]);
	const [statusEffect, setStatusEffect] = useState("loading");

	useEffect(() => {
		async function run() {
			let responseTrophs = await fetch("/api/find/trophs", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const jsonTrophs = await responseTrophs.json();
			setTrophs(jsonTrophs.data);
			if (session?.user?.email) {
				const response = await fetch("/api/find/stats", {
					method: "POST",
					body: JSON.stringify({
						email: session?.user?.email,
					}),
				});

				const { certain, errors, time } = await response.json();

				setStats({ certain, errors, time });

				let responseLastStudy = await fetch("/api/find/study", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						where: {
							userId: session?.user?.email,
						},
						orderBy: {
							date: "desc",
						},
					}),
				});

				const jsonLastStudy = await responseLastStudy.json(); // <- aguarda o JSON
				setLastStudy(jsonLastStudy.data[0]); // <- agora o .data vai existir

				let responseStudyData = await fetch("/api/find/study", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						filter: {
							where: {
								userId: {
									equals: session?.user?.email,
								},
							},
						},
					}),
				});

				const responseJson = await responseStudyData.json();
				const jsonStudyData = responseJson.data;

				if (jsonStudyData?.length > 0) {
					const labels = jsonStudyData.map((item: any, id: number) => id + 1);
					const horasEstudo = jsonStudyData.map((item: any) =>
						Math.floor(item.time / 60)
					);
					const acertos = jsonStudyData.map((item: any) => item.certain);
					const erros = jsonStudyData.map((item: any) => item.errors);

					const data = {
						labels,
						datasets: [
							{
								label: "Horas de estudo",
								data: horasEstudo,
								backgroundColor: "rgb(255, 99, 132)",
							},
							{
								label: "Acertos",
								data: acertos,
								backgroundColor: "rgb(75, 192, 192)",
							},
							{
								label: "Erros",
								data: erros,
								backgroundColor: "rgb(53, 162, 235)",
							},
						],
					};

					setChartData(data);
				} else {
					console.warn(
						"Nenhum dado retornado de /api/find/study",
						responseJson
					);
				}
			}

			setStatusEffect("loaded");
		}
		run();
	}, [status]);

	useEffect(() => {
		if (status === "loading") return; // ainda carregando, não redireciona

		if (!session?.user?.email) {
			router.push("/login");
		}
	}, [session, status]);

	if (statusEffect == "loading") {
		return <div>Loading...</div>;
	}

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-2 pb-2 sm:p-10 font-[family-name:var(--font-geist-sans)]">
			<header className="">
				<Image
					className="dark:invert"
					src="/next.svg"
					alt="Next.js logo"
					width={90}
					height={19}
					priority
				/>
			</header>
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				<div className="left w-[32vw] h-[87%] left-0 top-[12vh] absolute">
					<div className="profile flex flex-wrap w-[20vw] h-[35vh] ml-[12vw] bg-gray-800 justify-items-center rounded-sm">
						<div className="w-full flex justify-center">
							<div className="flex flex-col gap-2 items-center">
								<Avatar className="w-[5vw] h-[5vw] top-[-6vh]">
									<AvatarImage
										src={session?.user?.image || ""}
										alt={"Foto de " + session?.user?.name}
									/>
									<AvatarFallback>
										{session?.user?.name?.split(" ").slice(0, 2)[0][0] +
											" " +
											session?.user?.name?.split(" ").slice(0, 2)[1][0]}
									</AvatarFallback>
								</Avatar>

								<br />

								<h1 className="text-2xl font-bold text-center font-[family-name:var(--font-geist-mono)] text-gray-300 top-[-6vh] relative">
									{session?.user?.name?.split(" ").slice(0, 2)[0] +
										" " +
										session?.user?.name?.split(" ").slice(0, 2)[1]}
								</h1>

								<div className="flex h-5 justify-items-center space-x-4 text-sm top-[-1.5vh] relative">
									<div className="text-center">
										Acertos
										<br />
										<h3 className="text-gray-200 font-bold text-3xl">
											{stats.certain}
										</h3>
									</div>
									<Separator orientation="vertical" />
									<div className="text-center">
										Erros
										<br />
										<h3 className="text-gray-200 font-bold text-3xl">
											{stats.errors}
										</h3>
									</div>
									<Separator orientation="vertical" />
									<div className="text-center">
										Horas
										<br />
										<h3 className="text-gray-200 font-bold text-3xl">
											{Math.floor(stats.time / 60)}h
											{Math.floor(stats.time % 60)}
										</h3>
									</div>
								</div>

								{lastStudy ? (
									<div>
										<Separator
											orientation="horizontal"
											className="mt-[2vh] opacity-15"
										/>
										<div className="mt-[2vh] text-gray-500">
											Último estudo
											<ul className="ml-2">
												<li className="flex">
													<h3 className="text-gray-200 font-bold text-lg">
														{limitText(lastStudy.title, 15)} •
													</h3>
													<h3 className="mt-0.5 ml-2">
														{new Date(lastStudy.date).toLocaleDateString(
															"pt-BR",
															{
																day: "numeric",
																month: "short",
																year: "numeric",
															}
														)}
													</h3>
												</li>
											</ul>
										</div>
									</div>
								) : (
									<div></div>
								)}
							</div>
						</div>
					</div>
					<div className="goal w-[20vw] h-[48vh] ml-[12vw] mt-[2vw] bg-gray-800">
						<h1 className="p-8 text-2xl font-bold text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-gray-300">
							Metas
						</h1>

						<div className="bg-gray-500 mx-4 p-4">
							<span>
								Defina suas metas semanais e anuais e acompanhe seu progresso
								aqui.
							</span>
						</div>

						<div className="text-center text-xl mt-8 ">
							SEUS ESTUDOS
							{/* @ts-ignore */}
							<Bar options={options} data={chartData} />
						</div>
					</div>
				</div>
				<div
					className="center w-[64vw] h-[87%] left-[33.5vw] top-[12vh] overflow-y-auto absolute"
					style={{
						overflowY: "auto",
						scrollbarWidth: "none", // Firefox
						msOverflowStyle: "none", // Internet Explorer/Edge
					}}
				>
					<div className="mb-[2vh]">
						<Select defaultValue="todos">
							<SelectTrigger className="w-[12vw] border-2 border-blue-500 ring-1 ring-blue-500">
								<SelectValue placeholder="Selecione..." />
							</SelectTrigger>
							<SelectContent className="bg-gray-600 text-white border-2 border-gray-500">
								<SelectGroup>
									<SelectLabel className="text-gray-200 font-bold">
										Filtro
									</SelectLabel>
									<SelectItem value="todos">Totais</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<ul className="flex flex-col">
						{Object.values(
							trophs.reduce<
								Record<
									string,
									{
										userId: string;
										name: string;
										image: string;
										trophs: number;
									}
								>
							>((acc, item) => {
								const { userId, trophs: value, user } = item;

								if (!acc[userId]) {
									acc[userId] = {
										userId,
										name: user.name,
										image: user.image,
										trophs: 0,
									};
								}

								acc[userId].trophs += value;
								return acc;
							}, {})
						)
							.sort((a, b) => b.trophs - a.trophs)
							.map((troph, index) => (
								<li key={troph.userId}>
									<Player
										type="score"
										name={troph.name}
										photo={troph.image}
										position={index + 1}
										score={troph.trophs}
									/>
								</li>
							))}
					</ul>
					<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
						<a
							className="flex items-center gap-2 hover:underline hover:underline-offset-4"
							href="/dashboard"
							rel="noopener noreferrer"
						>
							<Image
								aria-hidden
								src="/globe.svg"
								alt="Globe icon"
								width={16}
								height={16}
							/>
							Dashboard →
						</a>
					</footer>
				</div>

				<button className="flex items-center justify-center fixed right-[4vw] bottom-[8vh] w-[3vw] h-[3vw] rounded-full bg-blue-600 hover:bg-blue-700 transition-transform duration-300 hover:scale-105 shadow-md hover:shadow-xl bg-opacity-80">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="28"
						height="28"
						fill="white"
						viewBox="0 0 24 24"
					>
						<path
							fillRule="evenodd"
							d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"
						/>
					</svg>
				</button>
			</main>
		</div>
	);
}
