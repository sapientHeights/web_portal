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

export type StudentAllData = {
    sId: string;
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
    registeredAt: string;
}

export const studentFieldLabels : Record<keyof StudentData, string> = {
    studentName: "Student Name",
    dob: "DOB",
    gender: "Gender",
    aadharNumber: "Aadhar Number",
    caste: "Caste",
    samagraId: "Samagra ID",
    studentMobile: "Student's Mobile",
    emailId: "Email ID",
    address: "Address",
    fatherName: "Father Name",
    motherName: "Mother Name",
    fatherMobile: "Father's Mobile",
    motherMobile: "Mother's Mobile",
    fatherOccupation: "Father Occupation",
    sessionId: "Session Id",
    studentClass: "Class",
    section: "Section",
    accountNumber: "Account Number",
    bankName: "Bank Name",
    branchName: "Branch Name",
    ifscCode: "IFSC Code",
};

export const studentDocLabels: Record<keyof StudentDocs, string> = {
    studentPic : "Student's Pic",
    fatherPic: "Father's Pic",
    motherPic: "Mother's Pic",
    birthCertificate: "Birth Certificate",
    sAadhar: "Student's Aadhar",
    fAadhar: "Father's Aadhar",
    mAadhar: "Mother's Aadhar",
    casteCertificate: "Caste Certificate",
    passbook: "Passbook",
    samagra: "Samagra"
}