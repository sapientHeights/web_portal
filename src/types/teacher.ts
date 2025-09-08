export type TeacherDocs = {
    teacherPic: File | null; 
    birthCertificate: File | null; 
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