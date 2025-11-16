export interface AuditLogResponseDTO {
    id: number;
    email: string;
    action: string;
    methodName: string;
    timestamp: string;
}