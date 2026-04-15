'use client';
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import "@material/web/textfield/outlined-text-field";
import "@material/web/button/filled-button.js";
import type { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field";
import { loadOnboardingDraft, saveOnboardingDraft } from "@/app/onboarding/onboardingStorage";

export default function BasicInfo() {
	const router = useRouter();
	const [draft] = useState(() => loadOnboardingDraft());
	const [firstName, setFirstName] = useState(draft.firstName);
	const [middleName, setMiddleName] = useState(draft.middleName);
	const [lastName, setLastName] = useState(draft.lastName);
	const [dateOfBirth, setDateOfBirth] = useState(draft.dateOfBirth);
	const [studentId, setStudentId] = useState(draft.studentId);
	
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		saveOnboardingDraft({
			firstName,
			middleName,
			lastName,
			dateOfBirth,
			studentId,
		});
		router.push("/onboarding/2");
	};
	
	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-2">Basic Info</h1>
			<p className="text-gray-600 mb-6">This is the first step of onboarding.</p>
			
			<form onSubmit={handleSubmit} className="space-y-4">
				<md-outlined-text-field label="First Name"
				                        type="text"
				                        required className="w-full"
				                        value={firstName}
				                        onChange={(e) =>
					                        setFirstName((e.currentTarget as MdOutlinedTextField).value)
				                        }
				/>
				
				<md-outlined-text-field label="Middle Name"
				                        type="text"
				                        className="w-full"
				                        value={middleName}
				                        onChange={(e) =>
					                        setMiddleName((e.currentTarget as MdOutlinedTextField).value)
				                        }
				/>
				
				<md-outlined-text-field label="Last Name"
				                        type="text"
				                        required className="w-full"
				                        value={lastName}
				                        onChange={(e) =>
					                        setLastName((e.currentTarget as MdOutlinedTextField).value)
				                        }
				/>
				
				<md-outlined-text-field label="Date of Birth"
				                        type="date"
				                        required className="w-full"
				                        value={dateOfBirth}
				                        onChange={(e) =>
					                        setDateOfBirth((e.currentTarget as MdOutlinedTextField).value)
				                        }
				/>
				
				<md-outlined-text-field label="Student ID"
				                        type="text"
				                        required className="w-full"
				                        value={studentId}
				                        onChange={(e) =>
					                        setStudentId((e.currentTarget as MdOutlinedTextField).value)
				                        }
				/>
				
				<md-filled-button type="submit" style={{ width: "100%" }}>
					Continue </md-filled-button>
			</form>
		</div>
	);
}
