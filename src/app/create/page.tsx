"use client";

import { useContext, useEffect, useState } from "react";
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

export default function EstudoForm() {
	const [foto, setFoto] = useState<string | null>(null);
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
	const [locationData, setLocationData] = useState(false)

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

	const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => setFoto(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async () => {
		const now = new Date();
		const dateWithTime = new Date(date!);
		dateWithTime.setHours(
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds()
		);
	
		const hours = parseInt(duracaoHoras.toString());
		const minutes = parseInt(duracaoMinutos.toString());
		const seconds = parseInt(duracaoSegundos.toString());
	
		const correct = parseInt(acertos.toString());
		const wrong = parseInt(erros.toString());
	
		const totalTime = hours * 60 + minutes + seconds / 60;
	
		const data = {
			photo: foto,
			userId: session?.user?.email,
			title: tema,
			date: dateWithTime,
			certain: correct,
			errors: wrong,
			time: totalTime,
			description: anotacoes,
			trophs: Math.floor(
				(((correct * 100) || 1) / ((correct + wrong) || 1)) * correct * (totalTime/60)
			),
			local: local?.address?.town + ", " + local?.address?.state,
		};
	
		const study = await fetch("/api/create/study", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ dados: data }),
		});
	
		router.push("/dashboard");
	};

	const handleClear = () => {
		setFoto(null);
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
		<div className="grid grid-rows-[20px_1fr_20px] min-h-screen min-w-screen p-2 pb-2 sm:p-10 font-[family-name:var(--font-geist-sans)]">
			{/* HEADER */}
			<header className="grid items-center justify-items-center w-full">
				<Image
					className="dark:invert"
					src="/next.svg"
					alt="Next.js logo"
					width={90}
					height={19}
					priority
				/>
			</header>

			{/* FORM CONTAINER */}
			<main className="flex flex-row gap-[32px] row-start-2 items-start mt-[10vh] bg-gray-800 ml-[10vw] p-[3vw] rounded-lg">
				<div className="flex flex-col w-full">
					<h2 className="text-3xl font-bold text-blue-500">Novo Registro</h2>

					<div className="flex flex-col md:flex-row gap-6 mt-6 w-full">
						{/* FOTO */}
						<div className="flex-1 flex flex-col items-center gap-4">
							<Label className="text-blue-400 text-lg font-semibold">
								Foto
							</Label>
							<div className="w-full bg-[#111827] p-4 rounded-xl border border-gray-700">
								<Input
									type="file"
									accept="image/*"
									onChange={handleFotoChange}
									className="text-white"
								/>
								{foto && (
									<Image
										src={foto}
										alt="Foto do estudo"
										width={300}
										height={300}
										className="mt-4 rounded-lg object-cover max-h-[300px] w-full"
									/>
								)}
							</div>
						</div>

						{/* FORMULÁRIO */}
						<div className="flex-2 flex flex-col gap-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="flex flex-col gap-2">
									<Label className="text-blue-300">Título</Label>
									<Input
										placeholder="Estudo da hora do almoço"
										value={tema}
										onChange={(e) => setTema(e.target.value)}
									/>
								</div>

								<div className="flex flex-col gap-2">
									<Label className="text-blue-300">Data do Estudo</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"w-full justify-start text-left font-normal bg-[#111827] text-white",
													!date && "text-muted-foreground"
												)}
											>
												{date ? (
													format(date, "PPP", { locale: ptBR })
												) : (
													<span>Escolha a data</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0 bg-white text-black">
											<Calendar
												mode="single"
												selected={date}
												onSelect={setDate}
												initialFocus
												locale={ptBR}
											/>
										</PopoverContent>
									</Popover>
								</div>

								<div className="flex flex-col gap-2">
									<Label className="text-blue-300">Acertos</Label>
									<Input
										type="number"
										placeholder="Ex: 10"
										value={acertos}
										onChange={(e) => setAcertos(e.target.value)}
									/>
								</div>

								<div className="flex flex-col gap-2">
									<Label className="text-blue-300">Erros</Label>
									<Input
										type="number"
										placeholder="Ex: 3"
										value={erros}
										onChange={(e) => setErros(e.target.value)}
									/>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-blue-300">Duração</Label>
								<div className="flex gap-2">
									<Input
										type="number"
										min={0}
										placeholder="h"
										className="w-20 text-center"
										value={duracaoHoras}
										onChange={(e) => setDuracaoHoras(e.target.value)}
									/>
									<Input
										type="number"
										min={0}
										max={59}
										placeholder="min"
										className="w-20 text-center"
										value={duracaoMinutos}
										onChange={(e) => setDuracaoMinutos(e.target.value)}
									/>
									<Input
										type="number"
										min={0}
										max={59}
										placeholder="s"
										className="w-20 text-center"
										value={duracaoSegundos}
										onChange={(e) => setDuracaoSegundos(e.target.value)}
									/>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-blue-300">Descrição</Label>
								<Textarea
									placeholder="Como foi? Compartilhe mais informações sobre sua atividade."
									className="min-h-[150px]"
									value={anotacoes}
									onChange={(e) => setAnotacoes(e.target.value)}
								/>
							</div>

							<div className="flex w-full justify-end mt-4 gap-4">
								<Button
									variant="outline"
									onClick={handleClear}
									className="border-blue-500 text-blue-400 hover:bg-blue-800 hover:text-white"
								>
									Limpar
								</Button>
								<Button
									onClick={handleSubmit}
									className="bg-blue-600 hover:bg-blue-700 transition-all px-6 py-2 text-lg"
								>
									Salvar Registro
								</Button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
