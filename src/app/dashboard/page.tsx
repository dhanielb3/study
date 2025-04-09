"use client";

import InputText from "@/components/input";
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
import example from "@/images/example.jpeg";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useContext, useEffect, useState } from "react";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

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

function formatDate(dataISO: string): string {
	const data = parseISO(dataISO);

	if (isToday(data)) {
		return `Hoje às ${format(data, "HH'h'mm", { locale: ptBR })}`;
	}

	if (isYesterday(data)) {
		return `Ontem às ${format(data, "HH'h'mm", { locale: ptBR })}`;
	}

	return format(data, "d 'de' MMM 'às' HH'h'mm", { locale: ptBR });
}

function limitText(text: string | undefined, maxLength: number = 15): string {
	if (!text) return "";
	return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export default function Home() {
	const router = useRouter();
	const [study, setStudy] = useState<
		{
			id: string;
			userId: string;
			title: string;
			photo: string;
			certain: number;
			errors: number;
			time: string;
			description: string;
			local: string;
			date: string;
			user: {
				image: string;
				id: string;
				userId: string;
				name: string;
				email: string;
			};
		}[]
	>([]);
	const [filter, setFilter] = useState("todos");
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
	const [statusEffect, setStatusEffect] = useState("loading");

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

	const { data: session, status } = useSession();

	useEffect(() => {
		if (status === "loading") return; // ainda carregando, não redireciona

		if (!session?.user?.email) {
			router.push("/login");
		}
	}, [session, status]);

	useEffect(() => {
		async function run() {
			let responseStudy = await fetch("/api/find/study", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					where: {},
				}),
			});

			const jsonStudy = await responseStudy.json(); // <- aguarda o JSON
			setStudy(jsonStudy.data); // <- agora o .data vai existir

			let responseTrophs = await fetch("/api/find/trophs", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const jsonTrophs = await responseTrophs.json();
			setTrophs(jsonTrophs.data);

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
					where: {},
				}),
			});

			const responseJson = await responseStudyData.json();
			const jsonStudyData = responseJson.data;

			if (jsonStudyData?.length > 0 && await session?.user?.email) {
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
				console.warn("Nenhum dado retornado de /api/find/study", responseJson);
			}

			setStatusEffect("loaded");
		}
		run();
	}, []);

	if (statusEffect == "loading") {
		return <div>Loading...</div>;
	}

	return (
		<>
			{status == "loading" ? (
				<div>Loading...</div>
			) : (
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
										Defina suas metas semanais e anuais e acompanhe seu
										progresso aqui.
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
							className="center w-[32vw] h-[87%] left-[33.5vw] top-[12vh] overflow-y-auto absolute"
							style={{
								overflowY: "auto",
								scrollbarWidth: "none", // Firefox
								msOverflowStyle: "none", // Internet Explorer/Edge
							}}
						>
							<div className="mb-[2vh]">
								<Select onValueChange={(e) => setFilter(e)} value={filter}>
									<SelectTrigger className="w-[12vw] border-2 border-blue-500 ring-1 ring-blue-500">
										<SelectValue placeholder="Selecione..." />
									</SelectTrigger>
									<SelectContent className="bg-gray-600 text-white border-2 border-gray-500">
										<SelectGroup>
											<SelectLabel className="text-gray-200 font-bold">
												Filtro
											</SelectLabel>
											<SelectItem value="todos">Todos</SelectItem>
											<SelectItem value="meus_estudos">Meus estudos</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
							<ul className="flex flex-col gap-8 ">
								{study.length != 0 ? (
									(() => {
										// Agrupar conquistas por usuário e por atividade
										const today = new Date().toDateString();

										const userStats: any = {};
										const activityStats: any[] = [];

										study.forEach((item) => {
											const itemDate = new Date(item.date).toDateString();
											const userEmail = item.userId;

											const totalQuestions = item.certain + item.errors;
											const percent = (item.certain * 100) / totalQuestions;

											if (!userStats[userEmail]) {
												userStats[userEmail] = {
													name: item.user?.name || "",
													totalTimeToday: 0,
													totalCorrectToday: 0,
													totalQuestionsToday: 0,
													highestAccuracy: 0,
													mostTime: 0,
													mostAccurateActivity: null,
													activities: [],
												};
											}

											if (itemDate === today) {
												userStats[userEmail].totalTimeToday += parseInt(
													item.time
												);
												userStats[userEmail].totalCorrectToday += item.certain;
												userStats[userEmail].totalQuestionsToday +=
													totalQuestions;
												if (percent > userStats[userEmail].highestAccuracy) {
													userStats[userEmail].highestAccuracy = percent;
													userStats[userEmail].mostAccurateActivity = item;
												}
											}

											if (parseInt(item.time) > userStats[userEmail].mostTime) {
												userStats[userEmail].mostTime = parseInt(item.time);
											}

											userStats[userEmail].activities.push(item);
											activityStats.push({ ...item, totalQuestions, percent });
										});

										// Conquistas globais do dia
										const mostStudyUser = Object.entries(userStats).sort(
											//@ts-ignore
											(a, b) => b[1].totalTimeToday - a[1].totalTimeToday
										)[0]?.[0];
										const mostQuestionsActivity = activityStats.sort(
											(a, b) => b.totalQuestions - a.totalQuestions
										)[0];
										const bestAccuracyActivity = activityStats
											.filter(
												(act) => new Date(act.date).toDateString() === today
											)
											.sort((a, b) => b.percent - a.percent)[0];
										const mostTimeActivity = activityStats.sort(
											(a, b) => b.time - a.time
										)[0];

										return study
											.filter(
												(item) =>
													filter === "todos" ||
													item.userId === session?.user?.email
											)
											.reverse()
											.map((activy, id) => {
												const {
													userId,
													title,
													certain,
													description,
													errors,
													time,
													photo,
													user,
													local,
													date,
												} = activy;

												const totalQuestions = certain + errors;
												const percent = (certain * 100) / totalQuestions;
												const isToday = new Date(date).toDateString() === today;

												const achievements = [];

												if (userId === mostStudyUser && isToday) {
													achievements.push({
														label:
															"Você foi o que mais estudou hoje! O trono é seu!",
														icon: "👑",
													});
												}
												if (activy === mostQuestionsActivity && isToday) {
													achievements.push({
														label:
															"Ninguém resolveu mais questões que você hoje — lenda absoluta!",
														icon: "🥇",
													});
												}
												if (
													activy === bestAccuracyActivity &&
													isToday &&
													percent >= 90
												) {
													achievements.push({
														label:
															"Sua precisão foi imbatível hoje — um verdadeiro gênio!",
														icon: "🎯",
													});
												}
												if (activy === mostTimeActivity) {
													achievements.push({
														label: `Você dominou o app inteiro com ${Math.floor(
															parseInt(time) / 60
														)}h${parseInt(time) % 60}min de estudo!`,
														icon: "🏆",
													});
												}
												if (percent === 100 && totalQuestions > 10) {
													achievements.push({
														label:
															"Combo Perfeito! 100% de acertos em mais de 10 questões!",
														icon: "💯",
													});
												}
												if (parseInt(time) >= 300) {
													achievements.push({
														label:
															"Ultramaratonista: mais de 5 horas em uma única sessão!",
														icon: "🏃‍♂️",
													});
												}
												if (new Date(date).getHours() < 6) {
													achievements.push({
														label:
															"Fera da Madrugada: você mandou ver antes das 6h!",
														icon: "🌙",
													});
												}

												return (
													<li
														key={id}
														className="w-[32vw] h-auto bg-gray-800 rounded-lg"
													>
														{/*</li>{session?.user?.email == user.email ? (
														</li>	<button
														</li>		className=" left-[28vw] top-[2vh] relative cursor-pointer font-bold text-red-500 "
														</li>		onClick={async () => {
														</li>			await fetch("/api/delete/study", {
														</li>				method: "POST",
														</li>				headers: {
														</li>					"Content-Type": "application/json",
														</li>				},
														</li>				body: JSON.stringify({
														</li>					filter: {
														</li>						where: {
														</li>							userId: user.email,
														</li>							id: activy.id,
														</li>						},
														</li>					},
														</li>				}),
														</li>			});
														</li>			alert("[ALERTA] Deletado.")
														</li>			router.push("/dashboard")
														</li>		}}
														</li>	>
														</li>		Deletar
														</li>	</button>
														</li>) : (
														</li>	<div></div>
														</li>)} */}
														<Player
															name={user?.name || "Usuário"}
															photo={user?.image || ""}
															local={local.indexOf("undefined") != -1 ? local : ""}
															dataFormated={formatDate(date)}
														></Player>
														<div className="text-left text-2xl ml-[4.5vw] mt-8 ">
															{title}
														</div>
														<div className="ml-[4.5vw] mt-[4vh]">
															<div className="flex h-5 items-center space-x-4 text-sm">
																<div className="text-center">
																	Acertos
																	<br />
																	<h3 className="text-gray-200 font-bold text-3xl">
																		{certain}
																	</h3>
																</div>
																<Separator orientation="vertical" />
																<div className="text-center">
																	Erros
																	<br />
																	<h3 className="text-gray-200 font-bold text-3xl">
																		{errors}
																	</h3>
																</div>
																<Separator orientation="vertical" />
																<div className="text-center">
																	Horas estudadas
																	<br />
																	<h3 className="text-gray-200 font-bold text-3xl">
																		{Math.floor(parseInt(time) / 60)}h
																		{Math.floor(parseInt(time) % 60)}min
																	</h3>
																</div>
																<Separator orientation="vertical" />
																<div className="text-center">
																	Porcentagem
																	<br />
																	<h3 className="text-gray-200 font-bold text-3xl">
																		{Math.floor(percent) || 0}%
																	</h3>
																</div>
																<Separator orientation="vertical" />
																<div className="text-center">
																	Conquistas
																	<br />
																	<div className="flex">
																		<span className="mt-2 mr-2">
																			<svg
																				fill="currentColor"
																				viewBox="0 0 24 24"
																				xmlns="http://www.w3.org/2000/svg"
																				width="18"
																				height="18"
																			>
																				<path
																					d="M4 1a1 1 0 011-1h14a1 1 0 011 1v1h2a2 2 0 012 2v4a5 5 0 01-5 5h-1.186a10.986 10.986 0 01-4.6 3.579l-.214.089v1.851l4.625 3.7A1 1 0 0117 24H7a1 1 0 01-.625-1.78L11 18.52v-1.852l-.214-.089A10.986 10.986 0 016.186 13H5a5 5 0 01-5-5V4a2 2 0 012-2h2zm15 10a3 3 0 003-3V4h-2v2.418c0 1.615-.353 3.172-1 4.582zm-1-9H6v4.418a9 9 0 005.552 8.314l.448.185.448-.185A9 9 0 0018 6.418zM4 6.418V4H2v4a3 3 0 003 3c-.647-1.41-1-2.967-1-4.582zM14.15 22L12 20.28 9.85 22z"
																					fill=""
																				></path>
																			</svg>
																		</span>
																		<h3 className="text-gray-200 font-bold text-lg">
																			{Math.max(
																				1,
																				Math.min(
																					Math.round(
																						(((certain /
																							(certain + errors + 1)) *
																							certain) /
																							(parseInt(time) / 60 + 1)) *
																							100
																					),
																					(parseInt(time) / 60) * 1000
																				)
																			)}{" "}
																			({achievements.length})
																		</h3>
																	</div>
																</div>
															</div>
															{achievements.length > 0 && (
																<div className="ml-[-3.5vw] mr-[1vw] mt-[4vh] flex bg-gray-600 px-6 py-4 rounded-md">
																	<div className="mr-[1vw]">
																		{achievements[0].icon}
																	</div>
																	{achievements[0].label}
																</div>
															)}
														</div>
														<div className="w-[30vw] h-auto ml-[1vw] mt-[1vh]">
															<code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
																{description.split("\n").map((line, i) => (
																	<React.Fragment key={i}>
																		{line}
																		<br />
																	</React.Fragment>
																))}
															</code>
															<Image
																src={photo || ""}
																width={100}
																height={100}
																objectFit="contain"
																className="w-[30vw]"
																alt=""
															></Image>
														</div>
														<div className="mb-[3vh]"></div>
													</li>
												);
											});
									})()
								) : (
									<div className="flex w-full h-full justify-center items-center">
										<h1 className="flex items-center gap-2 hover:underline hover:underline-offset-4">
											Não há nada por aqui...
										</h1>
									</div>
								)}
							</ul>
						</div>
						<div
							className="right-[1.5vw] bg-gray-900 w-[30vw] h-[87%] top-[12vh] rounded-lg overflow-y-auto absolute"
							style={{
								overflowY: "auto",
								scrollbarWidth: "none", // Firefox
								msOverflowStyle: "none", // Internet Explorer/Edge
							}}
						>
							<h1 className="mt-[2vw] ml-[2vw] text-2xl font-bold text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-gray-300">
								Troféu Geral
							</h1>
							<br></br>
							<ul className="pr-[2vw]">
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
									href="/progress"
									rel="noopener noreferrer"
								>
									<Image
										aria-hidden
										src="/globe.svg"
										alt="Globe icon"
										width={16}
										height={16}
									/>
									Placar geral →
								</a>
							</footer>
						</div>

						<a
							href="/create"
							rel="noopener noreferrer"
							className="flex items-center justify-center fixed right-[4vw] bottom-[8vh] w-[3vw] h-[3vw] rounded-full bg-blue-600 hover:bg-blue-700 transition-transform duration-300 hover:scale-105 shadow-md hover:shadow-xl bg-opacity-80"
						>
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
						</a>
					</main>
				</div>
			)}
		</>
	);
}
