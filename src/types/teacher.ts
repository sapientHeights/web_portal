export type TeacherDocs = {
    teacherPic: File | null; 
    panCard: File | null; 
    tAadhar: File | null;
    casteCertificate: File | null;
    passbook: File | null;
    samagra: File | null;
};

export type TeacherData = {
    teacherName: string;
    dob: string;
    gender: string;
    aadharNumber: string;
    caste: string;
    maritalStatus: string;
    samagraId: string;
    teacherMobile: string;
    emailId: string;
    bloodGroup: string;
    religion: string;
    panNumber: string;
    address: string;
    fatherName: string;
    motherName: string;
    spouseName: string;
    qualification: string;
    experience: string;
    empId: string;
    designation: string;
    doj: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
}

export type TeacherAllData = {
    tId: string;
    teacherName: string;
    dob: string;
    gender: string;
    aadharNumber: string;
    caste: string;
    maritalStatus: string;
    samagraId: string;
    teacherMobile: string;
    emailId: string;
    bloodGroup: string;
    religion: string;
    panNumber: string;
    address: string;
    fatherName: string;
    motherName: string;
    spouseName: string;
    qualification: string;
    experience: string;
    empId: string;
    designation: string;
    doj: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
    teacherPic: File | null; 
    birthCertificate: File | null; 
    tAadhar: File | null;
    casteCertificate: File | null;
    passbook: File | null;
    samagra: File | null;
}

export const teacherFieldLabels : Record<keyof TeacherData, string> = {
    teacherName: "Teacher Name",
    dob: "DOB",
    gender: "Gender",
    aadharNumber: "Aadhar Number",
    caste: "Caste",
    maritalStatus: "Marital Status",
    samagraId: "Samagra Id",
    teacherMobile: "Teacher Mobile",
    emailId: "Email ID",
    bloodGroup: "Blood Group",
    religion: "Religion",
    panNumber: "PAN Number",
    address: "Address",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    spouseName: "Spouse Name",
    qualification: "Qualification",
    experience: "Experience",
    empId: "Emp ID",
    designation: "Designation",
    doj: "DOJ",
    accountNumber: "Account Number",
    bankName: "Bank Name",
    branchName: "Branch Name",
    ifscCode: "IFSC Code"
};

export const teacherDocLabels: Record<keyof TeacherDocs, string> = {
    teacherPic: "Teacher's Pic", 
    panCard: "PAN Card", 
    tAadhar: "Teacher's Aadhar",
    casteCertificate: "Caste certificate",
    passbook: "Passbook",
    samagra: "Samagra"
}