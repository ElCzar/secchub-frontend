export interface StudentApplicationScheduleResponseDTO {
    id?: number;
    studentApplicationId?: number;
    day?: string;
    startTime?: string; // ISO time string (e.g., "14:30:00")
    endTime?: string;   // ISO time string (e.g., "16:00:00")
}