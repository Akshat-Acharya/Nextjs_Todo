import jwt  from "jsonwebtoken";
import axios from "axios";


export function getUserIdFromToken(token: string | undefined): number | null {
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
        return decoded.userId;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}

export function verifyTokenAndGetUserId(token: string | undefined): number | null {
    if (!token) {
        return null;
    }

    try {
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as { userId: number };
        return decoded.userId;
    } catch (error) {
        // This will catch invalid/expired tokens
        console.error("Token verification failed:", error);
        return null;
    }
}

export async function getTasksData() {
    try {
        const response = await axios.get('/api/tasks');
       
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("API Error: Failed to fetch tasks.", error);
        
        return []; 
    }
}