'use client';
import { useState, type FormEvent } from "react";
import "@material/web/textfield/outlined-text-field";
import "@material/web/button/filled-button.js";
import type { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field";
import { useRouter } from "next/navigation";

export default function EnrollmentInformation() {
    const router = useRouter();
    const [currentEnrollment, setCurrentEnrollment] = useState("");
    const [currentYear, setCurrentYear] = useState("");
    const [admissionDate, setAdmissionDate] = useState("");
    const [expectedGraduationDate, setExpectedGraduationDate] = useState("");
    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ currentEnrollment, currentYear, admissionDate, expectedGraduationDate });
    };
    
    return (
        <div className="max-w-md mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-2">Enrollment Information</h1>
            <p className="text-gray-600 mb-6">Please provide your enrollment information.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
            <md-outlined-text-field label="Enrollment Status"
                                        type="text"
                                        required className="w-full"
                                        value={currentEnrollment}
                                        onChange={(e) =>
                                            setCurrentEnrollment((e.currentTarget as MdOutlinedTextField).value)
                                        }
                />
                
                <md-outlined-text-field label="Current Year"
                                        type="text"
                                        required className="w-full"
                                        value={currentYear}
                                        onChange={(e) =>
                                            setCurrentYear((e.currentTarget as MdOutlinedTextField).value)
                                        }
                />
                <md-outlined-text-field label="Admission Date"
                                        type="date"
                                        required className="w-full"
                                        value={admissionDate}
                                        onChange={(e) =>
                                            setAdmissionDate((e.currentTarget as MdOutlinedTextField).value)
                                        }
                />
                
                <md-outlined-text-field label="Expected Graduation Date"
                                        type="date"
                                        required className="w-full"
                                        value={expectedGraduationDate}
                                        onChange={(e) =>
                                            setExpectedGraduationDate((e.currentTarget as MdOutlinedTextField).value)
                                        }
                />
                
                <div className="flex gap-3">
						<md-filled-button
							type="button"
							style={{ width: "100%" }}
							onClick={() => router.push("/onboarding/2")}
						>
							Back
						</md-filled-button>
						<md-filled-button type="submit" style={{ width: "100%" }}>
							Complete
						</md-filled-button>
					</div>
            </form>
        </div>
    );
}
