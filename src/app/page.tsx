"use client";

import Input from "@/components/input";
import Image from "next/image";

export default function Home() {
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				<Image
					className="dark:invert"
					src="/next.svg"
					alt="Next.js logo"
					width={180}
					height={38}
					priority
				/>
				<ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
					<li className="mb-2 tracking-[-.01em]">
						Insira seu e-mail e entre na sua{" "}
						<code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
							conta
						</code>
						.
					</li>
					<li className="tracking-[-.01em]">Aqui que a brincadeira acaba.</li>
				</ol>

					<form>
						<Input
							title="E-mail"
							placeholder="exemplo@gmail.com"
							type="email"
						></Input>

						<div className="flex gap-4 items-center flex-col sm:flex-row">
							<button
								className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-[20vw]"
                
							>
								<Image
									className="dark:invert"
									src="/vercel.svg"
									alt="Vercel logomark"
									width={20}
									height={20}
								/>
								Entrar
							</button>
						</div>
					</form>
			</main>

			<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="/signup"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/globe.svg"
						alt="Globe icon"
						width={16}
						height={16}
					/>
					Registrar →
				</a>
			</footer>
		</div>
	);
}
