"use client";

import { ChangeEvent, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FileUploaderRegular } from "@uploadcare/react-uploader/next";
import "@uploadcare/react-uploader/core.css";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";

const pubKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;

export default function EstudoForm() {
	const [photo, setPhoto] = useState<String | null>(null);
	const [tema, setTema] = useState("");
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [acertos, setAcertos] = useState("");
	const [erros, setErros] = useState("");
	const [duracaoHoras, setDuracaoHoras] = useState("");
	const [duracaoMinutos, setDuracaoMinutos] = useState("");
	const [duracaoSegundos, setDuracaoSegundos] = useState("");
	const [anotacoes, setAnotacoes] = useState("");
	const router = useRouter();
	const { data: session, status } = useSession();
	const [locationData, setLocationData] = useState(false);

	const [local, setLocal] = useState<{
		address: { town: string; state: string };
	}>();
	const [location, setLocation] = useState<{
		latitude: number;
		longitude: number;
	}>();

	const fetchApiData = async ({
		latitude,
		longitude,
	}: {
		latitude: number;
		longitude: number;
	}) => {
		const res = await fetch(
			`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
		);
		const data = await res.json();
		setLocal(data);
	};

	useEffect(() => {
		if ("geolocation" in navigator) {
			// Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
			navigator.geolocation.getCurrentPosition(({ coords }) => {
				const { latitude, longitude } = coords;
				setLocation({ latitude, longitude });
			});
		}
	}, []);

	useEffect(() => {
		// Fetch data from API if `location` object is set
		if (location) {
			fetchApiData(location);
		}
	}, [location]);

	const [files, setFiles] = useState<File[]>([]);
	//@ts-ignore
	//const handleChangeEvent = (e) => {
	//	//@ts-ignore
	//	const firstSuccessfulFile = e.allEntries.find(
	//		(file: { status: string }) => file.status === "success"
	//	);
	//	if (firstSuccessfulFile) {
	//		//@ts-ignore
	//		setFiles([firstSuccessfulFile]);
	//		setPhoto(firstSuccessfulFile.cdnUrl);
	//	}
	//};

	const handleSubmit = async () => {
		const now = new Date();
		if (!date) {
			alert("A data do estudo está ausente");
			return;
		}

		const dateWithTime = new Date(date);
		dateWithTime.setHours(
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds()
		);

		const hours = parseInt(duracaoHoras) || 0;
		const minutes = parseInt(duracaoMinutos) || 0;
		const seconds = parseInt(duracaoSegundos) || 0;

		const correct = parseInt(acertos) || 0;
		const wrong = parseInt(erros) || 0;

		const totalTime = hours * 60 + minutes + seconds / 60;

		let uploadedFileUrl = "";

		if (files.length > 0) {
			const formData = new FormData();
			formData.append("UPLOADCARE_STORE", "1");
			formData.append("UPLOADCARE_PUB_KEY", pubKey || "");
			formData.append("file", files[0]);

			const response = await fetch("https://upload.uploadcare.com/base/", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();
			uploadedFileUrl = `https://ucarecdn.com/${result.file}/`;
		}

		const data = {
			//@ts-ignore
			photo: uploadedFileUrl || "",
			userId: session?.user?.email,
			title: tema,
			date: dateWithTime,
			certain: correct,
			errors: wrong,
			time: totalTime,
			description: anotacoes,
			trophs: Math.round(correct * 15 - wrong * 10 + (totalTime / 60) * 90),
			local: local?.address
				? `${local.address.town}, ${local.address.state}`
				: "Localização desconhecida",
		};

		if (!data.userId) {
			alert("Usuário não identificado. Faça login novamente.");
		} else if (!data.title) {
			alert("O campo 'Tema' é obrigatório.");
		} else if (!data.date) {
			alert("A data do estudo está ausente.");
		} else if (data.certain == null || isNaN(data.certain)) {
			alert("Número de acertos inválido ou ausente.");
		} else if (data.errors == null || isNaN(data.errors)) {
			alert("Número de erros inválido ou ausente.");
		} else if (data.time == null || isNaN(data.time)) {
			alert("Tempo de estudo inválido ou ausente.");
		} else if (!data.description) {
			alert("Adicione alguma anotação antes de salvar.");
		} else {
			await fetch("/api/create/study", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ dados: data }),
			});
		}

        alert("Criando registro...")

		window.location.href = window.location.href;
	};

	const handleClear = () => {
		setFiles([]);
		setPhoto(null);
		setTema("");
		setDate(undefined);
		setAcertos("");
		setErros("");
		setDuracaoHoras("");
		setDuracaoMinutos("");
		setDuracaoSegundos("");
		setAnotacoes("");
	};

	useEffect(() => {
		if (status === "loading") return; // ainda carregando, não redireciona

		if (!session?.user?.email) {
			router.push("/login");
		}
	}, [session, status]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<a
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
			</DialogTrigger>
			<DialogContent
				className="min-w-[60vw] overflow-y-scroll scrollbar-hidden h-5/6 rounded-xl"
				style={{
					overflowY: "scroll",
					scrollbarWidth: "none",
					msOverflowStyle: "none",
				}}
			>
				<DialogHeader>
					<DialogTitle className="font-[family-name:var(--font-geist-mono)]">
						Criar estudo
					</DialogTitle>
					<DialogDescription>
						Adicione aqui as informações do seu estudo.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="flex flex-col gap-2">
						<Label className="text-blue-300 font-[family-name:var(--font-geist-mono)]">
							Título
						</Label>
						<Input
							placeholder="Estudo da hora do almoço"
							value={tema}
							onChange={(e) => setTema(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label className="text-blue-400 font-[family-name:var(--font-geist-mono)]">
							Foto
						</Label>
						<div className="w-full p-4 rounded-xl">
							<Input
								type="file"
								accept="image/*"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										const reader = new FileReader();
										reader.onloadend = () => {
											const base64String = reader.result?.toString() || "";
											setPhoto(base64String); // isso inclui "data:image/..." no começo
											setFiles([file]);
										};
										reader.readAsDataURL(file);
									}
								}}
							/>
							{photo && (
								<Image
									src={photo.toString()}
									alt="Foto do estudo"
									width={300}
									height={300}
									className="mt-4 rounded-lg object-cover max-h-[300px] w-full"
								/>
							)}
						</div>
					</div>
					<div className="grid grid-cols-4 items-start gap-4">
						<Label className="text-blue-400 font-[family-name:var(--font-geist-mono)] text-right pt-2">
							Data
						</Label>
						<div className="col-span-3 w-full">
							<LocalizationProvider
								dateAdapter={AdapterDateFns}
								adapterLocale={ptBR}
							>
								<ThemeProvider
									theme={createTheme({
										palette: {
											mode: "dark",
											primary: { main: "#3b82f6" },
										},
										typography: {
											fontFamily: "inherit",
										},
									})}
								>
									<StaticDateTimePicker
										displayStaticWrapperAs="mobile"
										defaultValue={new Date()}
										onChange={(newDate) => {
											if (newDate) {
												setDate(new Date(newDate));
											} else {
												setDate(undefined);
											}
										}}
										maxDate={new Date()}
										minutesStep={1} // Permite qualquer valor de minuto
										sx={{
											"& .MuiPickersLayout-root": {
												width: "100%",
												height: 100,
												overflow: "hidden",
												borderRadius: 2,
											},
											"& .MuiPickersCalendarHeader-root, & .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer, & .MuiClock-root":
												{
													fontSize: "0.75rem",
												},
											"& .MuiPaper-root": {
												backgroundColor: "#1e1e2f",
												color: "#e0e0e0",
											},
										}}
									/>
								</ThemeProvider>
							</LocalizationProvider>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div className="flex flex-col gap-2">
							<Label className="text-blue-400 font-[family-name:var(--font-geist-mono)]">
								Acertos
							</Label>
							<Input
								type="number"
								placeholder="Ex: 10"
								value={acertos}
								onChange={(e) => setAcertos(e.target.value)}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<Label className="text-blue-400 font-[family-name:var(--font-geist-mono)]">
								Erros
							</Label>
							<Input
								type="number"
								placeholder="Ex: 3"
								value={erros}
								onChange={(e) => setErros(e.target.value)}
							/>
						</div>
					</div>

					<div className="flex flex-col gap-6 w-full">
						{/* Duração */}
						<div className="flex flex-col gap-2 w-full">
							<Label className="text-blue-400 font-[family-name:var(--font-geist-mono)]">
								Duração
							</Label>
							<div className="flex gap-2 w-full">
								<Input
									type="number"
									min={0}
									placeholder="h"
									className="w-full max-w-[120px] text-center"
									value={duracaoHoras}
									onChange={(e) => setDuracaoHoras(e.target.value)}
								/>
								<Input
									type="number"
									min={0}
									max={59}
									placeholder="min"
									className="w-full max-w-[120px] text-center"
									value={duracaoMinutos}
									onChange={(e) => setDuracaoMinutos(e.target.value)}
								/>
								<Input
									type="number"
									min={0}
									max={59}
									placeholder="s"
									className="w-full max-w-[120px] text-center"
									value={duracaoSegundos}
									onChange={(e) => setDuracaoSegundos(e.target.value)}
								/>
							</div>
						</div>

						{/* Descrição */}
						<div className="flex flex-col gap-2 w-full">
							<Label className="text-blue-400 font-[family-name:var(--font-geist-mono)]">
								Descrição
							</Label>
							<Textarea
								placeholder="Como foi? Compartilhe mais informações sobre sua atividade."
								className="min-h-[150px] w-full"
								value={anotacoes}
								onChange={(e) => setAnotacoes(e.target.value)}
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleClear}
						className="border-blue-500 text-blue-400 font-[family-name:var(--font-geist-mono)] hover:bg-blue-800 hover:text-white"
					>
						Limpar
					</Button>
					<Button
						onClick={handleSubmit}
						className="bg-blue-600 hover:bg-blue-700 transition-all px-6 py-2 text-lg"
					>
						Salvar Registro
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
