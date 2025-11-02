export type FeeData = {
    sessionId: string;
    sId: string;
    classId: string;
    section: string;
    fee: number;
    discount: number;
    paid: number;
    studentName: string;
}

export type ClassFeeData = {
    classId: string;
    fee: number;
}

export type StudentPaymentReport = {
    sessionId: string;
    sId: string;
    classId: string;
    section: string;
    amount: string;
    paymentDate: string;
    paymentMode: string;
    remark: string;
    studentName: string;
}