'use client';

import { api } from "@/utils/auth";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage({ params }: { params: { id: string } }) {
	const paramsObj = React.use(params as any) as { id: string };
	const { token } = paramsObj;
	const router = useRouter();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			setIsLoading(false);
			return;
		}

		try {
			await api.post(`/users/reset-password/${token}`, { password });

			setSuccess(true);
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (err: unknown) {
			if ((err as any).response) {
				setError((err as any).response?.data?.message || 'Failed to reset password');
			} else if ((err as any).request) {
				setError("No response from server. Please check your connection.");
			} else {
				setError("Unexpected error occurred.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
			<div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-2xl shadow-xl p-8">
				<h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
					Reset Password
				</h2>

				{error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
				{success && (
					<p className="text-green-400 text-sm text-center mb-4">
						Password reset successfully. Redirecting to login...
					</p>
				)}

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label htmlFor="password" className="text-sm text-gray-300 block mb-1">
							New Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							placeholder="Enter new password"
							className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
						/>
					</div>

					<div>
						<label htmlFor="confirmPassword" className="text-sm text-gray-300 block mb-1">
							Confirm Password
						</label>
						<input
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							placeholder="Confirm new password"
							className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full py-3 flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition"
					>
						{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set New Password"}
					</button>
				</form>
			</div>
		</div>
	);
}
