export type StudentDocs = {
    studentPic: File | null;
    fatherPic: File | null;
    motherPic: File | null;
    birthCertificate: File | null;
    sAadhar: File | null;
    fAadhar: File | null;
    mAadhar: File | null;
    casteCertificate: File | null;
    passbook: File | null;
    samagra: File | null;
};

export type StudentData = {
    studentName: string;
    dob: string;
    gender: string;
    aadharNumber: string;
    caste: string;
    samagraId: string;
    studentMobile: string;
    emailId: string;
    address: string;
    fatherName: string;
    motherName: string;
    fatherMobile: string;
    motherMobile: string;
    fatherOccupation: string;
    sessionId: string;
    studentClass: string;
    section: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
};