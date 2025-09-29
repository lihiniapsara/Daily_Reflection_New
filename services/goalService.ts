import { db } from "@/firebase";
import { Goal } from "@/types/Goal";
import { auth } from "@/firebase";
import { addDoc, collection, doc, getDocs, updateDoc } from "firebase/firestore";

export const goalRef = collection(db,"goal")

export const createGoal = async (goal: Goal) => {
    try {
        const userId = auth.currentUser?.uid;
        if (userId) {
            const docRef = await addDoc(goalRef, { 
                ...goal, 
                userId,
                completed: false // Ensure completed status is always set
            });
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

export const getAllGoals = async () => {
    try {
        const querySnapshot = await getDocs(goalRef);
        console.log("Query Snapshot: ", querySnapshot);
        return querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
        })) as Goal[];
    } catch (e) {
        console.error("Error getting documents: ", e);
        return [];
    }
}

// Update an existing goal
export const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    
    const goalDoc = doc(db, "goal", goalId);
    await updateDoc(goalDoc, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    console.log("Document updated with ID: ", goalId);
    return goalId;
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
}