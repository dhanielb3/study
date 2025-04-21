"use client";
import InputText from "@/components/input";
import Image from "next/image";
import { FormEvent, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [name, setName] = useState("");
	const [photo, setPhoto] = useState<string | null>(null);
	const [fotoFile, setFotoFile] = useState<File | null>(null);
	const router = useRouter();

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFotoFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result?.toString() || "";
				setPhoto(base64String);
			};
			reader.readAsDataURL(file);
		}
	};

	async function SignUpWithEmail() {
		let response: any = await fetch("/api/find/user", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: email,
			}),
		});

		if ((await response.json())?.user?.email !== "") {
			let uploadedFotoUrl = "";

			if (fotoFile) {
				const formData = new FormData();
				formData.append("UPLOADCARE_STORE", "1");
				formData.append("UPLOADCARE_PUB_KEY", process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || ""); // coloca tua chave aqui
				formData.append("file", fotoFile);

				try {
					const uploadResponse = await fetch(
						"https://upload.uploadcare.com/base/",
						{
							method: "POST",
							body: formData,
						}
					);

					const uploadData = await uploadResponse.json();
					if (uploadData?.file) {
						uploadedFotoUrl = `https://ucarecdn.com/${uploadData.file}/`;
					} else {
						alert("Erro ao subir foto");
						return;
					}
				} catch (error) {
					console.error("Erro no upload da foto:", error);
					return;
				}
			}

			let user = await fetch("/api/create/user", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					dados: {
						email,
						foto: uploadedFotoUrl,
						name,
					},
				}),
			});

			if (user.ok) {
				const signInResult = await signIn("email", {
					email: email,
					callbackUrl: "/dashboard",
					redirect: true,
				});

				if (!signInResult?.ok) {
					return "error";
				}

				setEmail("");
				return "success";
			}
		} else {
			alert("[ALERTA] Usuário já existente");
		}
	}

	const { data: session } = useSession();

	useEffect(() => {
		if (session?.user) {
			router.push("/dashboard");
		}
	}, [session]);

	const Logout = async () => {
		signOut();
	};

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
						Insira seu e-mail e crie sua{" "}
						<code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
							conta
						</code>
						.
					</li>
					<li className="tracking-[-.01em]">
						Onde o filho chora e a mãe não vê.
					</li>
				</ol>

				<form
					onSubmit={async (e) => {
						e.preventDefault();
						if (email != "" && name != "" && photo != null && code == "kkk") {
							await SignUpWithEmail();
						} else {
							alert("[ALERTA] Preencha todos os dados corretamente");
						}
					}}
				>
					<InputText
						title="Nome completo"
						placeholder="seu nome completo aqui"
						type="text"
						onChange={(e) => {
							setName(e.target.value);
						}}
						value={name}
					></InputText>
					<InputText
						title="E-mail"
						placeholder="exemplo@gmail.com"
						type="email"
						onChange={(e) => {
							setEmail(e.target.value);
						}}
						value={email}
					></InputText>
					<span className="text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
						Foto
					</span>
					<br></br>
					<div className="w-full p-4 rounded-xl border border-gray-700">
						<Input
							type="file"
							accept="image/*"
							onChange={handlePhotoChange}
							className="text-white"
						/>
						{photo && (
							<Image
								src={photo}
								alt="Foto do estudo"
								width={300}
								height={300}
								className="mt-4 rounded-lg object-cover max-h-[300px] w-full"
							/>
						)}
					</div>
					<InputText
						title="Código de indicação"
						placeholder="código"
						type="text"
						onChange={(e) => {
							setCode(e.target.value);
						}}
						value={code}
					></InputText>

					<div className="flex gap-4 items-center flex-col sm:flex-row mt-16">
						<button className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-[20vw]">
							<Image
								className="dark:invert"
								src="/vercel.svg"
								alt="Vercel logomark"
								width={20}
								height={20}
							/>
							Registrar
						</button>
					</div>
				</form>
			</main>

			<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="/login"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="/globe.svg"
						alt="Globe icon"
						width={16}
						height={16}
					/>
					Login →
				</a>
			</footer>
		</div>
	);
}
