import { db } from "@/firebase";
import { JournalEntry } from "@/types/JournalEntry";
import { auth } from "@/firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";


export const journalRef = collection(db,"journal")




export const createJournal = async (journal: JournalEntry) => {
    console.log(journal , "  kkk")
    console.log(auth.currentUser?.uid)
    try {
        const userId = auth.currentUser?.uid;
        if (userId) {
            const docRef = await addDoc(journalRef, { ...journal, userId });
            console.log("Document written with ID: ", docRef.id);
            return docRef;
        } else {
            console.error("User not authenticated");
            throw new Error("User not authenticated");
        }
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
}

export const getAllJournals = async () => {
    try {
        const querySnapshot = await getDocs(journalRef);
        console.log("Query Snapshot: ", querySnapshot);
        return querySnapshot.docs.map((doc) => ({
            ...doc.data() , 
            id: doc.id
            
        } ))as JournalEntry[];
    } catch (e) {
        console.error("Error getting documents: ", e);
        return [];
    }    
}