"use client";

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
	ChartData,
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
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import React from "react";
import Create from "@/components/create";
import gfm from "@bytemd/plugin-gfm";
import { Editor, Viewer } from "@bytemd/react";
import "bytemd/dist/index.css";
import "./bytemd-dark.css";
import { formatDistanceToNow, differenceInDays } from "date-fns";

function formatarTempoPassado(data: Date): string {
	const agora = new Date();
	const dias = differenceInDays(agora, data);

	if (dias === 0) {
		// Se for no mesmo dia, mostra "há x minutos/horas"
		return formatDistanceToNow(data, { addSuffix: true, locale: ptBR });
	}

	if (dias < 30) {
		// Se tiver menos de 30 dias, mostra "x dias atrás"
		return `${dias} ${dias === 1 ? "dia" : "dias"} atrás`;
	}

	// Caso contrário, mostra a data no formato: 20/03/2025
	return format(data, "dd/MM/yyyy");
}

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const plugins = [
	gfm(),
	// Add more plugins here
];

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
	return text.length > maxLength
		? text.slice(0, maxLength).trimEnd() + "..."
		: text;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function getStaticPropsStudy() {
	let responseStudy = await fetch(`${BASE_URL}/api/find/study`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			filter: {
				orderBy: { date: "asc" },
			},
		}),
	});

	const jsonStudy = await responseStudy.json();
	return jsonStudy.data;
}

async function getStaticPropsTrophs() {
	let responseTrophs = await fetch(`${BASE_URL}/api/find/trophs`, {
		method: "POST",
		body: JSON.stringify({
			filter: {},
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});

	const jsonTrophs = await responseTrophs.json();
	return jsonTrophs.data;
}

async function getStaticPropsStats() {
	const response = await fetch(`${BASE_URL}/api/find/stats`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	});

	const jsonStats = await response.json();

	return jsonStats;
}

async function getStaticPropsCommentaries() {
	const response = await fetch(`${BASE_URL}/api/find/comment`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	});

	const jsonComments = await response.json();

	return jsonComments.data;
}

async function getStaticPropsStatus() {
	const response = await fetch(`${BASE_URL}/api/find/status`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({}),
	});

	const jsonStats = await response.json();

	return jsonStats.data;
}

export default function Home() {
	//variáveis hook
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
	const [chartData, setChartData] = useState<ChartData<"bar">>({
		labels: [],
		datasets: [],
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
	const [value, setValue] = useState("");
	const [commentIsOpen, setCommentIsOpen] = useState<{ [id: string]: boolean }>(
		{}
	);
	const [comments, setComments] = useState<
		{
			studyId: string;
			userId: string;
			userName: string;
			text: string;
			date: Date;
		}[]
	>([]);
	const [usersStatus, setUsersStatus] = useState<
		{ userId: string; status: string }[]
	>([]);

	useOnlineStatus();

	useEffect(() => {
		if (status === "loading") return; // ainda carregando, não redireciona

		if (!session?.user?.email) {
			router.push("/login");
		}
	}, [session, status]);

	useEffect(() => {
		let propsStudy;
		let propsTrophs;
		let propsStats;
		let propsCommentaries;
		let propsStatus;

		const fetchData = async () => {
			propsStudy = await getStaticPropsStudy();
			propsTrophs = await getStaticPropsTrophs();
			propsStats = await getStaticPropsStats();
			propsCommentaries = await getStaticPropsCommentaries();
			propsStatus = await getStaticPropsStatus();

			setStudy(propsStudy);
			setTrophs(propsTrophs);
			setComments(propsCommentaries);
			setUsersStatus(propsStatus);

			//filtrar usuário
			if (session?.user?.email) {
				// --- STUDY ---
				propsStudy.filter((item: { userId: string | null | undefined }) => {
					return item.userId !== session?.user?.email;
				});

				// --- TROPHS ---
				let studiesByUser = propsStudy.filter(
					(item: { userId: string | null | undefined }) => {
						return item.userId == session?.user?.email;
					}
				);

				setLastStudy(studiesByUser[studiesByUser.length - 1]);
				setStats(propsStats);

				if (studiesByUser?.length > 0) {
					const labels = studiesByUser.map((item: any, id: number) =>
						(id + 1).toString()
					);
					const horasEstudo = studiesByUser.map((item: any) =>
						Math.floor(item.time / 60)
					);
					const acertos = studiesByUser.map((item: any) => item.certain);
					const erros = studiesByUser.map((item: any) => item.errors);

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

					setChartData(
						data || {
							labels: [],
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
						}
					);
				} else {
					console.warn(
						"Nenhum dado retornado de /api/find/study",
						studiesByUser
					);
				}

				// --- STATS ---

				study.filter((item) => {
					return item.userId == session?.user?.email;
				});

				setStatusEffect("loaded");
			}
		};

		fetchData();
	}, [status]);

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
											<AvatarFallback>{session?.user?.name}</AvatarFallback>
										</Avatar>

										<br />

										<h1 className="text-2xl font-bold text-center font-[family-name:var(--font-geist-mono)] text-gray-300 top-[-6vh] relative">
											{(() => {
												const name = session?.user?.name || "";
												const parts = name.trim().split(" ");
												if (parts.length === 1) return parts[0];
												if (parts.length === 2)
													return `${parts[0]} ${parts[1]}`;
												return `${parts[0]} ${parts[1][0]}.`;
											})()}
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
													id: activyId,
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
												let commentStudy: {
													studyId: string;
													userId: string;
													userName: string;
													text: string;
													date: Date;
												}[] = [];

												commentStudy = comments.filter(
													(item) => item.studyId == activyId
												);

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
														<div className="flex justify-between items-center w-full pr-8 py-2">
															<Player
																name={user?.name || "Usuário"}
																photo={user?.image || ""}
																local={
																	local.indexOf("undefined") === -1
																		? local
																		: "Localização desconhecida"
																}
																dataFormated={formatDate(date)}
															/>
															{session?.user?.email == user.email ? (
																<button
																	className="ml-4 bg-red-500 text-red-900 px-3 py-1 rounded focus:bg-red-400 transition"
																	onClick={() => {
																		async function deleteStudy() {
																			await fetch(
																				`${BASE_URL}/api/delete/study/`,
																				{
																					method: "POST",
																					headers: {
																						"Content-Type": "application/json",
																					},
																					body: JSON.stringify({
																						filter: {
																							where: {
																								id: activyId,
																							},
																						},
																					}),
																				}
																			);

																			alert("Deletando registro...");

																			window.location.href =
																				window.location.href;
																		}

																		deleteStudy();
																	}}
																>
																	Deletar
																</button>
															) : (
																<div></div>
															)}
														</div>
														<div className="text-left text-2xl ml-[1vw] mt-8 ">
															{title}
														</div>
														<div className="ml-[1.5vw] mt-[4vh] mb-[4vh]">
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
																			{Math.round(
																				certain * 15 -
																					errors * 10 +
																					(parseInt(time) / 60) * 90
																			)}{" "}
																			({achievements.length})
																		</h3>
																	</div>
																</div>
															</div>
															{achievements.length > 0 && (
																<div className="mt-[4vh] ml-[-0.5vw] mr-[1vw] flex flex-wrap items-center bg-gray-600 px-6 py-4 rounded-md max-w-full break-words">
																	<div className="mr-2">
																		{achievements[0].icon}
																	</div>
																	<span className="text-gray-100">
																		{achievements[0].label}
																	</span>
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
																)) ||
																	"esta pessoa não é criativa... não coloca nem descrição (nada aqui...)"}
															</code>
															{photo ? (
																<Image
																	src={photo || ""}
																	width={600}
																	height={600}
																	objectFit="contain"
																	className="w-[30vw] mt-[3vh]"
																	alt=""
																></Image>
															) : (
																<div></div>
															)}
														</div>
														<div className="mx-[1vw] transition-all">
															{!commentIsOpen[activyId] ? (
																<button
																	onClick={() => {
																		setCommentIsOpen((prev) => ({
																			...prev, // Copia o estado anterior
																			[activyId]: !prev[activyId], // Alterna o valor para o activyId
																		}));
																	}}
																	className="my-[3vh] px-[1.3vw] py-[0.8vh] bg-gray-600 text-white font-bold shadow-accent rounded-lg border focus:bg-gray-700"
																>
																	Responder
																</button>
															) : null}

															{commentIsOpen[activyId] ? (
																<div className="mt-[6vh]">
																	<Editor
																		value={value}
																		plugins={plugins}
																		onChange={(v: string) => {
																			if (v.length < 5000) {
																				setValue(v);
																			} else {
																				alert(
																					"Limite de letras excedidos no comentário"
																				);
																			}
																		}}
																	/>
																	<div className="w-full flex justify-end gap-2 px-[3vw] ml-[2.5vw]">
																		<button
																			onClick={() => {
																				setCommentIsOpen((prev) => ({
																					...prev, // Copia o estado anterior
																					[activyId]: !prev[activyId], // Alterna o valor para o activyId
																				}));
																			}}
																			className="cursor-pointer my-[3vh] px-[1.3vw] py-[0.8vh] text-gray-200 rounded-lg focus:bg-gray-700"
																		>
																			Cancelar
																		</button>
																		<button
																			onClick={() => {
																				async function createComment() {
																					console.log("HEEHEH");
																					await fetch(
																						`${BASE_URL}/api/create/comment`,
																						{
																							method: "POST",
																							headers: {
																								"Content-Type":
																									"application/json",
																							},
																							body: JSON.stringify({
																								dados: {
																									userId: session?.user?.email,
																									studyId: activyId,
																									userName: session?.user?.name,
																									text: value,
																								},
																							}),
																						}
																					);

																					console.log("HAAHAH");

																					alert("Criando comentário...");
																					window.location.href =
																						window.location.href;
																				}

																				createComment();
																			}}
																			className="cursor-pointer my-[3vh] px-[1.3vw] py-[0.8vh] bg-green-600 text-white font-bold shadow-accent rounded-lg border focus:bg-gray-600 transition-all"
																		>
																			Enviar
																		</button>
																	</div>
																</div>
															) : null}
															<div className="p-4 rounded-md max-w-xl">
																<ul>
																	{commentStudy.map(
																		(
																			item: {
																				userId: string;
																				userName: string;
																				text: string;
																				date: Date;
																			},
																			commentId: number
																		) => {
																			const {
																				userId,
																				userName,
																				text,
																				date: dateComment,
																			} = item;

																			return (
																				<li className="mt-4" key={commentId}>
																					<div className="flex items-center gap-2 mb-1">
																						<span className="bg-blue-100 text-blue-600 text-sm font-semibold px-2 py-1 rounded">
																							{userName}
																						</span>
																						<span className="text-gray-500 text-xs">
																							{formatarTempoPassado(
																								new Date(
																									//@ts-ignore
																									dateComment
																								)
																							)}
																						</span>
																					</div>
																					<p>{text}</p>
																				</li>
																			);
																		}
																	)}
																</ul>
															</div>
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
							<div className="flex items-center justify-between pb-[0.5vw] px-[2vw] mt-[3vh]">
								<h1 className="text-2xl font-bold text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-gray-300">
									Troféu Geral
								</h1>
							</div>
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

						<Create></Create>
					</main>
				</div>
			)}
		</>
	);
}
