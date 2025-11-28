'use client';

import { useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from 'next/link';
import { api } from "@/utils/auth";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			await api.post('/users/forgot-password', { email });
			setIsSubmitted(true);
		} catch (error: unknown) {
			if ((error as any).response) {
				setError((error as any).response?.data?.message || 'Failed to send reset email');
			} else if ((error as any).request) {
				setError('No response from server. Check your connection.');
			} else {
				setError('An unexpected error occurred.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col justify-center items-center bg-gray-950 px-4">
			<div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-lg shadow-lg p-8">
				<h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-6">
					Forgot Password
				</h2>

				{error && (
					<p className="text-sm text-red-500 font-medium mb-4 text-center">{error}</p>
				)}

				{!isSubmitted ? (
					<form onSubmit={handleSubmit} className="space-y-6">
						<p className="text-sm text-gray-300 text-center">
							Enter your email address and we'll send you a link to reset your password.
						</p>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								placeholder="you@example.com"
								className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
							/>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
						>
							{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
						</button>
					</form>
				) : (
					<div className="text-center space-y-4">
						<Mail className="w-8 h-8 text-green-400 mx-auto" />
						<p className="text-gray-300">
							If an account exists for <span className="font-medium text-white">{email}</span>, a password reset link has been sent.
						</p>
					</div>
				)}

				<div className="mt-6 text-center">
					<Link href="/login" className="inline-flex items-center text-sm text-green-400 hover:underline">
						<ArrowLeft className="w-4 h-4 mr-1" />
						Back to Login
					</Link>
				</div>
			</div>
		</div>
	);
}
