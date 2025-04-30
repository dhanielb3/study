"use client";

import {
	Divider,
	Card,
	Metric,
	Grid,
	Title,
	Text,
	Subtitle,
	Table,
	TableHead,
	TableHeaderCell,
	TableBody,
	TableRow,
	TableCell,
	Badge,
	BadgeDelta,
	ProgressBar,
	AreaChart,
	BarChart,
	Flex,
	Switch,
	Accordion,
	AccordionHeader,
	AccordionBody,
	AccordionList,
	Callout,
	Button,
	DonutChart,
	Legend,
	Dialog,
	DialogPanel,
	SearchSelect,
	SearchSelectItem,
	TextInput,
	NumberInput,
	DatePicker,
	Textarea,
	DatePickerValue,
	LineChart,
	SparkAreaChart,
	CategoryBar,
	BarList,
	Bold,
	ScatterChart,
	TabGroup,
	TabList,
	Tab,
} from "@tremor/react";
import { Tracker } from "@/components/Trackerr";
import revisionImg from "@/images/revision.svg";
import Image from "next/image";
import { JSXElementConstructor, useEffect, useState } from "react";
import {
	addDays,
	format,
	intervalToDuration,
	isAfter,
	isBefore,
	isEqual,
	isSameDay,
	isValid,
	parse,
	parseISO,
	startOfWeek,
} from "date-fns";
import React from "react";
import studyDayImg from "@/images/studyDay.svg";
import { Checkbox } from "@/components/ui/checkbox";
import dataQuote from "@/dataQuote.json";

const valueFormatter = (hours: number) => {
	hours = hours / 60;
	const roundedHours = Math.floor(hours);
	const minutes = Math.round((hours - roundedHours) * 60);

	const hoursPart = roundedHours > 0 ? `${roundedHours}h` : "";
	const minutesPart = minutes > 0 ? ` ${minutes}min` : "";

	return `${hoursPart}${minutesPart}`;
};

export default function dashboard({
	studyTime,
	studyCertain,
	studyError,
	studyProgress,
	studyTracker,
	studyStreak,
	studyData,
}: {
	studyTime: string;
	studyCertain: number;
	studyError: number;
	studyProgress: number;
	studyTracker: {
		color: string;
		tooltip: string;
	}[];
	studyStreak: number;
	studyData: {
		key: string;
		studyTitle: string;
		studyTime: number;
		studyCertain: number;
		studyError: number;
		studyDifficult: React.JSX.Element;
		studyDate: string;
		studyComment: string;
		studyTrophs: number;
	}[];
}) {
	const [quote, setQuote] = useState<{
		quote: string;
		author: string;
		//@ts-ignore
	}>({});

	useEffect(() => {
		setQuote(dataQuote[Math.floor(Math.random() * dataQuote.length)]);
	}, []);

	return (
		<div className="my-[10vh]">
			<Metric
				className="font-[family-name:var(--font-geist-mono)] font-extrabold text-[3rem] mx-[5vw] my-[4vh]"
				style={{
					color: "white",
				}}
			>
				Home
			</Metric>

			<Grid className="flex flex-col 2xl:gap-6 max-w-[90vw] mx-[5vw] gap-4">
				<Grid className="flex flex-col 2xl:flex-row 2xl:justify-between max-w-[90vw] gap-6 2xl:gap-0">
					<Card
						className="2xl:w-96 h-48 bg-white rounded-lg border-black border-opacity-10 ring-0 border-0"
						style={{
							background: "#1F2937",
							borderColor: "white",
						}}
					>
						<Title
							className="font-bold font-sans"
							style={{
								color: "white",
							}}
						>
							TEMPO DE ESTUDO
						</Title>
						<Metric
							className="font-extrabold text-[2.5rem] bottom-1 right-8 absolute"
							style={{
								color: "white",
							}}
						>
							{studyTime}
						</Metric>
					</Card>

					<Card
						className="2xl:w-96 h-48 bg-white rounded-lg border-black border-opacity-10 ring-0 border-0"
						style={{
							background: "#1F2937",
							borderColor: "white",
						}}
					>
						<Title
							className="font-bold font-sans"
							style={{
								color: "white",
							}}
						>
							DESEMPENHO
						</Title>
						<Text className="text-green-400">
							{studyCertain} Exercícios certos
						</Text>
						<Text className="text-red-400">
							{studyError} Exercícios errados
						</Text>
						<Metric
							className="font-extrabold text-[2.5rem] bottom-1 right-8 absolute"
							style={{
								color: "white",
							}}
						>
							{Math.round(studyCertain / (studyError + studyCertain))}%
						</Metric>
					</Card>

					<Card
						className="2xl:w-96 h-48 bg-white rounded-lg border-black border-opacity-10 ring-0 border-0"
						style={{
							background: "#1F2937",
							borderColor: "white",
						}}
					>
						<Title
							className="font-bold font-sans text-[#00000080]"
							style={{
								color: "white",
							}}
						>
							PROGRESSO NO EDITAL
						</Title>
						<Text className="text-green-400">Tópicos finalizados</Text>
						<Text className="text-red-400">Tópicos totais</Text>
						<Metric
							className="font-extrabold text-[2.5rem] bottom-1 right-8 absolute"
							style={{
								color: "white",
							}}
						>
							{studyProgress}
						</Metric>
					</Card>
					<Card
						className="flex text-center 2xl:w-96 h-48 bg-white rounded-lg border-black border-opacity-10 justify-center items-center ring-0 border-0"
						style={{
							background: "#1F2937",
						}}
					>
						<Text className="text-[1.05rem] font-sans italic">
							{quote.quote} - {quote.author}
						</Text>
					</Card>
				</Grid>
				<Card
					className="bg-white 2xl:w-[90vw] h-48 md:h-36 rounded-lg ring-0 border-0"
					style={{
						background: "#1F2937",
					}}
				>
					<div className="flex flex-col md:flex-row gap-4">
						<Title
							className="font-bold font-sans"
							style={{
								color: "white",
							}}
						>
							CONSTÂNCIA NO ESTUDO
						</Title>
						{/* <NumberInput
							className="w-[5vw]"
							max={0}
							min={-100}
							value={0}
							onValueChange={(e) => {}}
						></NumberInput> */}
					</div>
					<Subtitle>Você está há {studyStreak} dias sem falhar</Subtitle>
					<Tracker
						data={studyTracker}
						className="flex z-50 h-10 transition-all"
					></Tracker>
				</Card>
				<Card
					className="2xl:w-[90vw] bg-white rounded-lg ring-0 border-0"
					style={{
						background: "#1F2937",
					}}
				>
					<Title
						className="font-bold font-sans mb-[4vh]"
						style={{
							color: "white",
						}}
					>
						PAINEL
					</Title>
					<Table>
						<TableHead>
							<TableRow>
								<TableHeaderCell>Título</TableHeaderCell>
								<TableHeaderCell>Tempo de Estudo</TableHeaderCell>
								<TableHeaderCell>Produtividade</TableHeaderCell>
								<TableHeaderCell></TableHeaderCell>
								<TableHeaderCell></TableHeaderCell>
								<TableHeaderCell className="text-gray-500">T</TableHeaderCell>
								<TableHeaderCell>Dificuldade</TableHeaderCell>
								<TableHeaderCell>Data</TableHeaderCell>
								<TableHeaderCell>Comentário</TableHeaderCell>
								<TableHeaderCell>Deletar</TableHeaderCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{studyData.map((item, id) => {
								const time = item.studyTime;
								const date = item.studyDate;
								const certain = item.studyCertain;
								const error = item.studyError;
								const status = item.studyDifficult;
								const comment = item.studyComment;
								const trophs = item.studyTrophs;
								const title = item.studyTitle;
								const studyProductivy =
									trophs / ((certain + error) * 15 + time * 90);

								const formattedDate = (() => {
									if (!date) {
										return "Data inválida";
									}

									// Usando parseISO do date-fns para converter o timestamp ISO em uma data
									const parsedDate = parseISO(date);

									// Verificando se a data é válida
									if (isValid(parsedDate)) {
										// Retorna a data formatada como 'dd/MM/yyyy'
										return format(parsedDate, "dd/MM/yyyy");
									}

									return "Data inválida";
								})();

								return (
									<TableRow key={id}>
										<TableCell className="whitespace-pre-wrap break-words max-w-xs">
											<Text>{title}</Text>
										</TableCell>
										<TableCell>
											{Math.floor(time)}h{Math.floor((time % 1) * 60)}
										</TableCell>
										<TableCell className="text-center">
											<Text>{Math.round(studyProductivy * 100) || 100}%</Text>
										</TableCell>
										<TableCell className="text-center">
											<Text>{certain}</Text>
										</TableCell>
										<TableCell className="text-center">
											<Text>{error}</Text>
										</TableCell>
										<TableCell className="text-center">
											<Text>
												{certain + error} (
												{Math.round((certain / (certain + error)) * 100) || "-"}
												%)
											</Text>
										</TableCell>
										<TableCell>{status}</TableCell>
										<TableCell className="text-center">
											<Text>{formattedDate}</Text>
										</TableCell>
										<TableCell className="whitespace-pre-wrap break-words max-w-xs">
											<Text>{comment}</Text>
										</TableCell>
										<TableCell>
											<Button color="rose" onClick={() => {}}>
												Deletar
											</Button>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</Card>
				<p className="text-center text-white text-xl font-bold">
					Em construção...
				</p>
				<div className="blur">
					<Card
						className="bg-white 2xl:w-[90vw] h-64 md:h-48 rounded-lg ring-0 border-0"
						style={{
							background: "#1F2937",
						}}
					>
						<div className="flex flex-col md:flex-row gap-4">
							<Title
								className="font-bold font-sans"
								style={{
									color: "white",
								}}
							>
								METAS DE ESTUDO SEMANAL
							</Title>
							{/* <NumberInput
							className="w-[5vw]"
							max={0}
							min={-100}
							value={1}
							onValueChange={(e) => {}}
						></NumberInput> */}
						</div>
						<div className="mt-3">
							<Text className="mt-2">
								{1}h {0}min / {10}h {0}min
							</Text>
							<ProgressBar
								showAnimation
								value={(1 / 10) * 100}
								color="teal"
								className="mt-3"
							></ProgressBar>
						</div>
						<div className="mt-6">
							<Text className="mt-2">
								{2} / {100}
							</Text>
							<ProgressBar
								showAnimation
								value={(1 / 100) * 100}
								color="teal"
								className="mt-3"
							></ProgressBar>
						</div>
					</Card>
					<Card
						className="bg-white 2xl:w-[90vw] rounded-lg ring-0 border-0"
						style={{
							background: "#1F2937",
						}}
					>
						<div className="flex flex-col md:flex-row gap-4">
							<Title
								style={{
									color: "white",
								}}
							>
								TEMPO SEMANAL
							</Title>
							<NumberInput
								className="w-[5vw]"
								max={0}
								min={-100}
								value={1}
								onValueChange={(e) => {}}
							></NumberInput>
							<Button
								onClick={() => {}}
								style={{
									background:
										"QUESTÕES" != "QUESTÕES" ? "transparent" : "#3b83f3",
									color: "QUESTÕES" != "QUESTÕES" ? "gray" : "#172554",
								}}
							>
								Tempo
							</Button>
							<Button
								onClick={() => {}}
								style={{
									background:
										"QUESTÕES" == "QUESTÕES" ? "transparent" : "#3b83f3",
									color: "QUESTÕES" == "QUESTÕES" ? "gray" : "#172554",
								}}
							>
								Questões
							</Button>
						</div>
						<Subtitle>
							Semana ({1}) -{" "}
							<b>
								{format(
									startOfWeek(new Date().setDate(new Date().getDate() + 7 * 1)),
									"dd/MM/yyyy"
								)}{" "}
								|{" "}
								{format(
									new Date().setDate(new Date().getDay() + 7 * 1),
									"dd/MM/yyyy"
								)}
							</b>
						</Subtitle>
						{false ? (
							<div>
								{/*<BarChart
                            className="mt-6"
                            data={[]}
                            index="name"
                            categories={["time"]}
                            colors={["blue"]}
                            valueFormatter={valueFormatter}
                            yAxisWidth={48}
                            showAnimation={true}
                        /> */}
							</div>
						) : (
							<BarChart
								className="mt-6"
								enableLegendSlider
								style={{
									borderTopLeftRadius: "10px", // Altere o valor conforme necessário
									borderTopRightRadius: "10px", // Altere o valor conforme necessário
								}}
								data={[]}
								index="name"
								categories={["certain", "error"]}
								colors={["blue", "rose"]}
								valueFormatter={(e: number) => {
									return String(e);
								}}
								yAxisWidth={48}
								stack={true}
								showAnimation={true}
							/>
						)}
					</Card>
					<Card
						className="bg-white 2xl:w-[90vw] rounded-lg gap-4 ring-0 border-0"
						style={{
							background: "#1F2937",
						}}
					>
						<Title
							style={{
								color: "white",
							}}
						>
							ESTATÍSTICAS DE ESTUDO
						</Title>
						<ScatterChart
							data={[]}
							className="mt-6"
							category="Matéria"
							x="Minuto/Acerto"
							y="Porcentagem"
							size="Tempo"
							showOpacity={true}
							valueFormatter={{
								x: (e: number) => String(e) + " Minutos por acerto",
								y: (e: number) => String(e) + "%",
								size: (e: number) => {
									if (e >= 1440) {
										const days = Math.floor(e / 1440);
										const hours = Math.floor((e % 1440) / 60);
										const minutes = e % 60;
										return `${Math.floor(days)}d${Math.floor(
											hours
										)}h${Math.floor(minutes)}min;`;
									} else if (e >= 60) {
										const hours = Math.floor(e / 60);
										const minutes = e % 60;
										return `${Math.floor(hours)}h${Math.floor(minutes)}min`;
									} else {
										return `${Math.round(e)}min`;
									}
								},
							}}
							showLegend={false}
						></ScatterChart>
					</Card>
					<Card
						className="2xl:w-[90vw] ring-0 border-0"
						style={{
							background: "#1F2937",
						}}
					>
						<div className="flex flex-col md:flex-row gap-4">
							<Title
								className="font-bold font-sans"
								style={{
									color: "white",
								}}
							>
								PLANEJAMENTO
							</Title>
							<NumberInput
								className="w-[5vw]"
								max={0}
								min={-100}
								value={1}
								onValueChange={(e) => {}}
							></NumberInput>
						</div>
						<div className="grid grid-flow-row grid-row-1 mt-[2rem]">
							{[].length > 0 ? (
								<div>
									{[].map(
										(
											element: {
												name: string;
												time: number;
												color: string;
												maxTime: number;
												hex: string;
											},
											id
										) => {
											const studyMatter = element.name;
											const studyTime = element.time;
											const studyColor = element.color;
											const studyMaxTime = element.maxTime;

											return (
												<Callout
													key={id}
													style={{}}
													className="grid grid-flow-row grid-cols-1 mb-8 cursor-pointer"
													title={""}
													color="neutral"
												>
													<Title
														className="hover:underline"
														style={{
															color: "white",
														}}
													>
														{studyMatter}
													</Title>
													<Text className="flex">
														{Math.floor(studyTime / 60)}h{" "}
														{Math.floor(studyTime % 60)}
														min / {Math.floor(studyMaxTime / 60)}h{" "}
														{Math.floor(studyMaxTime % 60)}min
													</Text>
													<ProgressBar
														showAnimation
														value={(100 * studyTime) / studyMaxTime}
														color="blue"
													></ProgressBar>
													<Button className="z-50 mt-2" onClick={() => {}}>
														Adicionar estudo
													</Button>
												</Callout>
											);
										}
									)}
								</div>
							) : (
								<div>
									<AreaChart
										data={[]}
										index="date"
										categories={["", ""]}
										colors={["green", "red"]}
										yAxisWidth={30}
										curveType="monotone"
									/>
								</div>
							)}
						</div>
					</Card>
					<Card
						className="2xl:w-[90vw] ring-0 border-0"
						style={{
							background: "#1F2937",
						}}
					>
						<Title
							style={{
								color: "white",
							}}
						>
							EVOLUÇÃO NO TEMPO
						</Title>
						<AreaChart
							data={[]}
							index="date"
							categories={["Acertos", "Erros"]}
							colors={["green", "red"]}
							yAxisWidth={30}
							curveType="monotone"
						/>
					</Card>
					<Grid className="grid grid-flow-row grid-row-1 2xl:grid-flow-col 2xl:grid-col-2 gap-3">
						<Card
							className="2xl:w-[40vw] ring-0 border-0"
							style={{
								background: "#1F2937",
								borderColor: "white",
							}}
						>
							<Title
								style={{
									color: "white",
								}}
							>
								ESTUDO DO DIA
							</Title>
							<div
								className="flex items-center justify-center flex-row"
								style={{
									color: "white",
									display: [].some((element) => 0 !== 0) ? "none" : "flex",
									height: "100%", // Set the height to 100% to center vertically
								}}
							>
								<Image
									priority
									src={studyDayImg}
									className="w-[12.5rem]"
									alt="logo"
								/>
								<span>Você não tem registro de estudo hoje</span>
							</div>
							<div
								style={{
									display: [].some((element) => 0 !== 0) ? "flex" : "none",
								}}
							>
								<Grid className="flex flex-col">
									<DonutChart
										className="w-[80vw] h-[80vw] md:w-[85vw] md:h-[85vw] lg:w-[82.5vw] lg:h-[82.5vw] 2xl:w-[36vw] 2xl:h-[36vw] mt-8 mb-8"
										variant="pie"
										category="time"
										index="name"
										valueFormatter={valueFormatter}
										data={(() => {
											return [];
										})()}
										showAnimation={true}
									></DonutChart>
									<Flex className="mt-4">
										<Text>
											<Bold>Disciplinas</Bold>
										</Text>
										<Text>
											<Bold>Tempo estudado</Bold>
										</Text>
									</Flex>
									<BarList
										className="mt-4"
										valueFormatter={valueFormatter}
										data={((): {
											name: string;
											value: number;
											icon: JSXElementConstructor<any>;
										}[] => {
											let dataa: {
												name: string;
												value: number;
												icon: JSXElementConstructor<any>;
											}[] = [];

											[].map((element: { name: string; time: number }) => {
												if (element.time != 0) {
													dataa.push({
														name: element.name,
														value: element.time,
														icon: function Icon() {
															return (
																<div className="avatar w-7 h-7 mr-4">
																	<div className="z-50 w-7 h-7 flex justify-center items-center font-bold text-sm absolute">
																		{element.name.slice(0, 2).toUpperCase()}
																	</div>
																	<div className="z-40 absolute rounded-full bg-white opacity-30"></div>
																	<div
																		className="w-full h-full rounded-full animate-spin-slow"
																		style={{}}
																	></div>
																</div>
															);
														},
													});
												}
											});

											return dataa;
										})()}
									></BarList>
								</Grid>
							</div>
						</Card>
						<Card
							className="2xl:w-[48vw] 2xl:h-auto ring-0 border-0"
							style={{
								background: "#1F2937",
								borderColor: "white",
							}}
						>
							<Title
								style={{
									color: "white",
								}}
							>
								REVISÕES
							</Title>
							<div
								className="flex items-center justify-center flex-row"
								style={{
									color: "white",
									display: [].length === 0 ? "flex" : "none",
									height: "100%", // Set the height to 100% to center vertically
								}}
							>
								<Image
									priority
									src={revisionImg}
									className="w-[12.5rem]"
									alt="logo"
								/>
								<span>Você não tem revisões agendadas para hoje</span>
							</div>
							<div
								className="grid grid-flow-row grid-row-1 mt-[2rem]"
								style={{
									display: [].length == 0 ? "none" : "block",
								}}
							>
								<Table>
									<TableHead>
										<TableRow className="hover:bg-gray-200 hover:bg-opacity-20">
											<TableHeaderCell>Finalizado</TableHeaderCell>
											<TableHeaderCell>Disciplina</TableHeaderCell>
											<TableHeaderCell>Subtópico</TableHeaderCell>
											<TableHeaderCell>Atrasada?</TableHeaderCell>
											<TableHeaderCell>Comentário</TableHeaderCell>
											<TableHeaderCell>Data</TableHeaderCell>
											<TableHeaderCell>Revisão</TableHeaderCell>
											<TableHeaderCell>Dificuldade</TableHeaderCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{[].map(
											(
												item: {
													data: {
														_id: string;
														studyCourse: string;
														studyMatter: string;
														studySubTopic: string;
														studyDifficult: string;
														studyDate: string;
														studyTime: number;
														studyComment: string;
													};
													revision: string;
													late: boolean;
													revisionDate: string;
													revisionDiff: number;
												},
												id
											) => {
												const itemId = item.data._id;
												const course = item.data.studyCourse;
												const matter = item.data.studyMatter;
												const subTopic = item.data.studySubTopic;
												const revisionData = item.revision;
												const status = item.data.studyDifficult;
												const date = item.data.studyDate;
												const time = item.data.studyTime;
												const revisionDay = item.revisionDate;

												let badge = <BadgeDelta>{status}</BadgeDelta>;

												switch (status) {
													case "Fácil":
														badge = (
															<BadgeDelta deltaType="increase">
																{status}
															</BadgeDelta>
														);
														break;

													case "Médio":
														badge = (
															<BadgeDelta deltaType="unchanged">
																{status}
															</BadgeDelta>
														);
														break;

													case "Difícil":
														badge = (
															<BadgeDelta deltaType="decrease">
																{status}
															</BadgeDelta>
														);
														break;
												}

												let isLate = <BadgeDelta>{status}</BadgeDelta>;

												if (item.late) {
													isLate = (
														<BadgeDelta deltaType="decrease">
															Atrasada
														</BadgeDelta>
													);
												} else {
													isLate = (
														<BadgeDelta deltaType="increase">
															Para hoje
														</BadgeDelta>
													);
												}

												return (
													<TableRow
														className="hover:bg-gray-200 hover:bg-opacity-10"
														key={matter + id}
													>
														<TableCell>
															<Checkbox
																className="rounded-md p-2 mr-8 bg-gray-300 text-black border-0"
																onCheckedChange={() => {}}
															></Checkbox>
														</TableCell>
														<TableCell className="text-gray-300">
															{matter}
														</TableCell>
														<TableCell>
															<Text>{subTopic}</Text>
														</TableCell>
														<TableCell>{isLate}</TableCell>
														<TableCell>
															{item.data.studyComment || "-"}
														</TableCell>
														<TableCell>
															Revisão de {revisionDay} dias ({item.revision}º) -
															Estudado a {item.revisionDiff} dias atrás
														</TableCell>
														<TableCell>{date}</TableCell>
														<TableCell>{badge}</TableCell>
													</TableRow>
												);
											}
										)}
									</TableBody>
								</Table>
							</div>
						</Card>
					</Grid>
				</div>
			</Grid>
		</div>
	);
}
