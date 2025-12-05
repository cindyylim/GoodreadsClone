'use client';

import { api } from "@/utils/auth";
import { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function VerifyEmail() {
	const login = useAuthStore((state) => state.login);
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const router = useRouter();

	const handleChange = (index: number, value: string) => {
		const newCode = [...code];

		if (value.length > 1) {
			const pasted = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pasted[i] || "";
			}
			setCode(newCode);

			// Focus next empty
			const nextIndex = newCode.findIndex((v) => !v);
			if (nextIndex !== -1) {
				inputRefs.current[nextIndex]?.focus();
			}
			return;
		}

		newCode[index] = value;
		setCode(newCode);

		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const verificationCode = code.join("");
		try {
			const res = await api.post('/users/verify-email', { verificationCode });
			login(res.data.user);
			router.push('/books');
		} catch (err: unknown) {
			if ((err as any).response) {
				setError((err as any).response?.data?.message || 'Verification failed');
			} else if ((err as any).request) {
				setError("No response from server. Check your connection.");
			} else {
				setError("Unexpected error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
			<div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-2xl shadow-2xl p-8">
				<h2 className="text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
					Verify Your Email
				</h2>
				<p className="text-sm text-center text-gray-300 mb-6">
					Enter the 6-digit code sent to your email address.
				</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="flex justify-between gap-2">
						{code.map((digit, index) => (
							<input
								key={index}
								type="text"
								inputMode="numeric"
								maxLength={1}
								value={digit}
								onChange={(e) => handleChange(index, e.target.value.replace(/\D/, ''))}
								onKeyDown={(e) => handleKeyDown(index, e)}
								ref={(el) => { inputRefs.current[index] = el; }}
								className="w-12 h-12 md:w-14 md:h-14 text-center text-2xl font-semibold rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
							/>
						))}
					</div>

					{error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

					<button
						type="submit"
						disabled={isLoading || code.some(c => c === "")}
						className="w-full py-3 px-4 flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition"
					>
						{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Email"}
					</button>
				</form>
			</div>
		</div>
	);
}
