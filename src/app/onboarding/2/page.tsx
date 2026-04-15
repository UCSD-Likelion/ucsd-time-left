"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import "@material/web/select/outlined-select";
import "@material/web/select/select-option";
import "@material/web/button/filled-button.js";
import type { MdOutlinedSelect } from "@material/web/select/outlined-select";
import { loadOnboardingDraft, saveOnboardingDraft } from "@/app/onboarding/onboardingStorage";

export default function AcademicBackground() {
	const router = useRouter();
	const [draft] = useState(() => loadOnboardingDraft());
	const [college, setCollege] = useState(draft.college);
	const [major, setMajor] = useState(draft.major);
	const [minor, setMinor] = useState(draft.minor);
	const [isDoubleMajor, setIsDoubleMajor] = useState(draft.isDoubleMajor);
	const [secondMajor, setSecondMajor] = useState(draft.secondMajor);
	const [isDoubleMinor, setIsDoubleMinor] = useState(draft.isDoubleMinor);
	const [secondMinor, setSecondMinor] = useState(draft.secondMinor);
	const [colleges, setColleges] = useState<string[]>([]);
	const [majors, setMajors] = useState<string[]>([]);
	const [minors, setMinors] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const [collegesRes, majorsRes] = await Promise.all([
					fetch("/api/colleges"),
					fetch("/api/majors"),
				]);

				const collegesData = await collegesRes.json();
				const majorsData = await majorsRes.json();

				setColleges(collegesData.colleges || []);
				setMajors(majorsData.majors || []);
				setMinors(majorsData.minors || []);
			} catch (error) {
				console.error("Error fetching academic data:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		saveOnboardingDraft({
			college,
			major,
			minor,
			isDoubleMajor,
			secondMajor: isDoubleMajor ? secondMajor : "",
			isDoubleMinor,
			secondMinor: isDoubleMinor ? secondMinor : "",
		});
		router.push("/onboarding/3");
	};

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-2">Academic Background</h1>
			<p className="text-gray-600 mb-6">Tell us about your academic information.</p>

			{loading ? (
				<div className="text-center py-8">Loading...</div>
			) : (
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<md-outlined-select
							label="UCSD College"
							required
							className="w-full"
							value={college}
							onChange={(e) =>
								setCollege((e.currentTarget as MdOutlinedSelect).value)
							}
						>
							{colleges.map((collegeName) => (
								<md-select-option key={collegeName} value={collegeName}>
									<div slot="headline">{collegeName}</div>
								</md-select-option>
							))}
						</md-outlined-select>
					</div>

					<div>
						<md-outlined-select
							label="Major"
							required
							className="w-full"
							value={major}
							onChange={(e) =>
								setMajor((e.currentTarget as MdOutlinedSelect).value)
							}
						>
							{majors.map((majorName) => (
								<md-select-option key={majorName} value={majorName}>
									<div slot="headline">{majorName}</div>
								</md-select-option>
							))}
						</md-outlined-select>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="doubleMajor"
							checked={isDoubleMajor}
							onChange={(e) => {
								setIsDoubleMajor(e.target.checked);
								if (!e.target.checked) setSecondMajor("");
							}}
							className="w-4 h-4"
						/>
						<label htmlFor="doubleMajor" className="text-sm">
							Double Major
						</label>
					</div>

					{isDoubleMajor && (
						<div>
							<md-outlined-select
								label="Second Major"
								required
								className="w-full"
								value={secondMajor}
								onChange={(e) =>
									setSecondMajor((e.currentTarget as MdOutlinedSelect).value)
								}
							>
								{majors.map((majorName) => (
									<md-select-option key={majorName} value={majorName}>
										<div slot="headline">{majorName}</div>
									</md-select-option>
								))}
							</md-outlined-select>
						</div>
					)}

					<div>
						<md-outlined-select
							label="Minor (Optional)"
							className="w-full"
							value={minor}
							onChange={(e) =>
								setMinor((e.currentTarget as MdOutlinedSelect).value)
							}
						>
							{minors.map((minorName) => (
								<md-select-option key={minorName} value={minorName}>
									<div slot="headline">{minorName}</div>
								</md-select-option>
							))}
						</md-outlined-select>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="doubleMinor"
							checked={isDoubleMinor}
							onChange={(e) => {
								setIsDoubleMinor(e.target.checked);
								if (!e.target.checked) setSecondMinor("");
							}}
							className="w-4 h-4"
						/>
						<label htmlFor="doubleMinor" className="text-sm">
							Double Minor
						</label>
					</div>

					{isDoubleMinor && (
						<div>
							<md-outlined-select
								label="Second Minor"
								required
								className="w-full"
								value={secondMinor}
								onChange={(e) =>
									setSecondMinor((e.currentTarget as MdOutlinedSelect).value)
								}
							>
								{minors.map((minorName) => (
									<md-select-option key={minorName} value={minorName}>
										<div slot="headline">{minorName}</div>
									</md-select-option>
								))}
							</md-outlined-select>
						</div>
					)}

					<div className="flex gap-3">
						<md-filled-button
							type="button"
							style={{ width: "100%" }}
							onClick={() => router.push("/onboarding/1")}
						>
							Back
						</md-filled-button>
						<md-filled-button type="submit" style={{ width: "100%" }}>
							Continue
						</md-filled-button>
					</div>
				</form>
			)}
		</div>
	);
}
