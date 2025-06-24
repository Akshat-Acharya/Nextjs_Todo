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

export async function getTasksData() {
    try {
        const response = await axios.get('/api/tasks');
        // Ensure the response data is an array before returning
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        // The API call failed (e.g., 401 Unauthorized error)
        console.error("API Error: Failed to fetch tasks.", error);
        
        // Return an empty array to prevent the application from crashing.
        return []; 
    }
}