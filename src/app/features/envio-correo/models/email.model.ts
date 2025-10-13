export interface Email {
  to: string;
  subject: string;
  message: string;
  signatureUrl?: string;
}
