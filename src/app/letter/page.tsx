"use client"
import { useState } from "react";

export default function Letter(){
    // const [content, setContent] = useState("");
    // const [receiver, setReceiver] = useState("");
    const [docId, setDocId] = useState("");
    const [result, setResult] = useState<{ echoed: string; length: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function send() {
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/letter/get", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId: docId }),
            });

            if (!res.ok) {
                // if validation fails, Next will return 400/500; show something friendly
                const msg = await res.text();
                throw new Error(msg);
            }

            const data = (await res.json()) as { echoed: string; length: number };
            setResult(data);
        } catch (e: unknown) {
            if (e instanceof Error) setError(e.message);
            else setError("Request failed");
        }
    }

    return (
        <html>
            <body>
            <main style={{ padding: 24 }}>
                <h1>Get letter</h1>

                <input
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    placeholder="Type docId..."
                    style={{ padding: 8, width: 320 }}
                />
                <button onClick={send} style={{ marginLeft: 8, padding: "8px 12px" }}>
                    Get data
                </button>

                {result && (
                    <pre style={{ marginTop: 16 }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                )}

                {error}
                {/* {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>} */}
            </main>
            </body>
        </html>
    );
}





// export default Letter();