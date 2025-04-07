import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "./ui/separator";

export default function Player({
	name,
	photo,
	type = "default",
	position = 1,
	score = 0,
	certain = 0,
	errors = 0,
	hours = "0min",
	dataFormated,
	local
}: {
	name: string;
	photo: string;
	type?: string;
	position?: number;
	score?: number;
	certain?: number;
	errors?: number;
	hours?: string;
	dataFormated?: string;
	local?: string;
}) {
	return (
		<div>
			{type == "default" ? (
				<div className="my-4 flex">
					<Avatar className="w-12 h-12 ml-[1vw] mt-[0.5vh] relative">
						<AvatarImage src={photo} alt="@shadcn" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<div className="flex flex-col ml-[1vw] mt-[0.25vh]">
						<span className="text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
							{name}
						</span>
						<span className="text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-gray-300">
							{dataFormated} · {local}
						</span>
					</div>
				</div>
			) : (
				<div className="flex w-full">
					<Avatar className="w-12 h-12 ml-[1vw] relative">
						<AvatarImage src={photo} alt="@shadcn" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>

					<div className="flex flex-col ml-[1vw] w-full">
						<span className="text-sm/6 font-[family-name:var(--font-geist-mono)]">
							{name}
						</span>
						<div className="flex items-center relative">
							<span className="px-2">
								<svg
									fill="#ce8601"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									width="18"
									height="18"
								>
									<path d="M4 1a1 1 0 011-1h14a1 1 0 011 1v1h2a2 2 0 012 2v4a5 5 0 01-5 5h-1.186a10.986 10.986 0 01-4.6 3.579l-.214.089v1.851l4.625 3.7A1 1 0 0117 24H7a1 1 0 01-.625-1.78L11 18.52v-1.852l-.214-.089A10.986 10.986 0 016.186 13H5a5 5 0 01-5-5V4a2 2 0 012-2h2zm15 10a3 3 0 003-3V4h-2v2.418c0 1.615-.353 3.172-1 4.582zm-1-9H6v4.418a9 9 0 005.552 8.314l.448.185.448-.185A9 9 0 0018 6.418zM4 6.418V4H2v4a3 3 0 003 3c-.647-1.41-1-2.967-1-4.582zM14.15 22L12 20.28 9.85 22z" />
								</svg>
							</span>
							<h3 className="text-yellow-600 font-bold text-2xl">{score}</h3>
						</div>
					</div>
					<div className="flex h-5 items-center space-x-4 justify-end ">
						{type == "progress" ? (
							<div className="flex h-5 items-center space-x-4 text-sm">
								<div className="text-center">
									Acertos
									<br></br>
									<h3 className="text-gray-200 font-bold text-xl">{certain}</h3>
								</div>
								<Separator orientation="vertical" />
								<div className="text-center">
									Erros <br></br>
									<h3 className="text-gray-200 font-bold text-xl">{errors}</h3>
								</div>
								<Separator orientation="vertical" />
								<div className="text-center">
									Horas <br></br>
									<h3 className="text-gray-200 font-bold text-xl">{hours}</h3>
								</div>
								<div className="text-center">
									Porcentagem <br></br>
									<h3 className="text-gray-200 font-bold text-xl" style={{
										color: (() => {
											if(Math.floor(certain/(certain+errors)*100) >= 90) {
												return "green"
											}else if(Math.floor(certain/(certain+errors)*100) < 90 && Math.floor(certain/(certain+errors)*100) >= 60) {
												return "orange"
											}else{
												return "red"
											}
										})()
									}}>{Math.floor(certain/(certain+errors)*100)}%</h3>
								</div>
							</div>
						) : (
							<div></div>
						)}
						{position != 1 ? (
							<div className="text-gray-200 font-bold text-[2vw] ml-[1.5vw] right-[0.5vw]">
								{position}
							</div>
						) : (
							<div className="ml-[1vw]">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-[2vw] h-[2vw]"
									fill="#FDC746"
									viewBox="0 0 24 24"
								>
									<path d="M19.67 2.29V.33H4.33v1.96h-4v3.55a2.756 2.756 0 0 0 1.13 2.58c.29.2.92.56 1.6.93V7.81c-.37-.21-.672-.387-.84-.5-.5-.332-.55-.73-.55-1.47v-2.2h2.66v7.5c.002.242.029.483.08.72a4.571 4.571 0 0 0 1.99 2.86l3.23 1.84c.552.315 1.12.602 1.7.86v2.57L6.92 22.3v1.37h10.16V22.3l-4.41-2.35v-2.46c.32-.15.83-.42 1.72-.93l3.22-1.84a4.54 4.54 0 0 0 1.99-2.81c.059-.252.09-.51.09-.77l-.02-7.5h2.66v2.2c0 .74-.06 1.13-.55 1.47-.16.11-.46.29-.83.49v1.54c.68-.37 1.3-.72 1.59-.92a2.757 2.757 0 0 0 1.13-2.58V2.29h-4z" />
								</svg>
							</div>
						)}
					</div>
					<div className="flex items-center justify-end"></div>
				</div>
			)}
		</div>
	);
}
