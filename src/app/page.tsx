"use client"

import { useEffect, useState } from "react";
import { usePageLeave } from "react-use";

export default function Home() {
	const [lastView, setLastView] = useState<number>(0)

	usePageLeave(() => localStorage.setItem("lastView", Date.now().toString()));

	useEffect(() => {
		setLastView(Number(localStorage.getItem("lastView")))
	}, [])

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			{new Date(lastView).toISOString()}
		</div>
	);
}
