export class CreateTransactionDto {
    userId: string;
    courseId: string;
    amount?: string;
    status?:  "completed"
        | "in_process"
        | "rejected"
        | "ready_to_be_checked"
        | null;
    paymentMethod?: 'zelle' | 'paypal' | null;
    userBalanceAmount?: string | null;
}
