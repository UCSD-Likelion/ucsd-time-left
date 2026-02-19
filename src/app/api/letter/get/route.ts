import { db } from '@/Functions/firebase/clientApp';
import { Letter } from '@/app/api/letter/letter.dao';
import { collection, doc, getDoc } from 'firebase/firestore';

export async function POST(req: Request){
    try{
        const body = (await req.json()) as { documentId?:unknown };

        if(!(typeof body.documentId == "string")){
            return new Response("Invalid document id", { status: 400 });
        }

        const lettersCol = collection(db, "letters");
        const docRef = doc(lettersCol, body.documentId);


        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data()
            
            const result: Letter = {
                id: body.documentId,
                content: data.content,
                date: data.date,
                receiverId: data.receiverId,
                senderId: data.senderId,
            }
            
            return Response.json(result);
        } else {
            return new Response("Document does not exist", { status: 400 });
        }


    } catch (e) {
        console.error("Getting letter: ", e)
        return new Response("Error during getting letter", { status: 400 });
    }
}