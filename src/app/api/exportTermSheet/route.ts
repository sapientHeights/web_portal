import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import {
    TERM_OPTIONS,
    EXAM_TYPE_OPTIONS,
    EXAM_TYPE_EXCEL_COLORS,
    SINGLE_MARK_EXAM_TYPE
} from "@/lib/examConstants";

type StudentTermSheet = {
    sId: string;
    studentName: string;
    motherName: string;
    fatherName: string;
    address: string;
    curClass: string;
    dob: string;
    examId: string;
    examName: string;
    subjectId: string;
    examType: string;
    maxMarks: string;
    marks: string | null;
    att: string | null;
};

type StudentExtraData = {
    height: string;
    weight: string;
    workEducation: string;
    attendance: string;
    discipline: string;
    thinkingSkill: string;
    remark: string;
};

type ExcelRequestBody = {
    data: StudentTermSheet[];
    subjects: string[];
    extraData: Record<string, StudentExtraData>;
};

type SubExamHeader = {
    title: string;
    examType: string;
};

// Shared grade-band lookup so subject grades and the overall year grade use
// the same bands
const gradeForPercentage = (percentage: number): string => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";
};

export async function POST(req: NextRequest) {
    try {
        const { data, subjects, extraData }: ExcelRequestBody = await req.json();

        if (
            !data ||
            data.length === 0 ||
            !subjects ||
            subjects.length === 0
        ) {
            return new Response(
                JSON.stringify({ error: "No data provided" }),
                { status: 400 }
            );
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("TermSheet");

        // Freeze first 2 columns and header row
        worksheet.views = [
            {
                state: "frozen",
                xSplit: 2,
                ySplit: 1
            }
        ];

        // Get unique students
        const studentsData = [
            ...new Map(
                data.map(d => [
                    d.sId,
                    {
                        sId: d.sId,
                        studentName: d.studentName,
                        motherName: d.motherName,
                        fatherName: d.fatherName,
                        address: d.address,
                        curClass: d.curClass,
                        dob: d.dob
                    }
                ])
            ).values()
        ];

        // Get single exam subjects
        const singleExamSubjects = [
            ...new Set(
                data.filter(d => d.examType == 'Quiz').map(d => d.subjectId)
            )
        ]

        // console.log(singleExamSubjects)

        // -----------------------------------------
        // Generate subject/exam headers
        // -----------------------------------------

        const subExamHeaders: SubExamHeader[] = [];

        subjects.forEach(sub => {
            TERM_OPTIONS.forEach(term => {
                const termNumber =
                    term === "Term 1"
                        ? "1"
                        : term === "Term 2"
                            ? "2"
                            : "3";

                EXAM_TYPE_OPTIONS.forEach(exam => {
                    const examType =
                        exam === "Theory"
                            ? "T"
                            : exam === "Conceptual Test"
                                ? "C"
                                : exam === "Activity"
                                    ? "Act"
                                    : exam === "Attendance"
                                        ? "Att"
                                        : "Dict";

                    const maxMarks =
                        data.find(
                            d =>
                                d.examName === term &&
                                d.subjectId === sub &&
                                d.examType === exam
                        )?.maxMarks ?? "";

                    const header = `${examType}${exam === "Theory" || exam === "Conceptual Test"
                        ? termNumber
                        : ""
                        }(${maxMarks})\n${sub}`;

                    subExamHeaders.push({
                        title: header,
                        examType: exam
                    });
                });

                // Term total
                subExamHeaders.push({
                    title: `Total T-${termNumber}\n${sub}`,
                    examType: "Total"
                });
            });

            // Subject grand total
            subExamHeaders.push({
                title: "Total T-4",
                examType: "Total"
            });

            // Percentage (own column)
            subExamHeaders.push({
                title: `Per%${sub}`,
                examType: "Percentage"
            });

            // Grade (own column)
            subExamHeaders.push({
                title: `Grade-${sub}`,
                examType: "Grade"
            });
        });

        singleExamSubjects.forEach(sub => {
            TERM_OPTIONS.forEach(term => {
                const termNumber =
                    term === "Term 1"
                        ? "1"
                        : term === "Term 2"
                            ? "2"
                            : "3";

                const exam = SINGLE_MARK_EXAM_TYPE
                const examType =
                    exam === "Quiz"
                        ? "T"
                        : "";

                const maxMarks =
                    data.find(
                        d =>
                            d.examName === term &&
                            d.subjectId === sub &&
                            d.examType === exam
                    )?.maxMarks ?? "";

                const header = `${examType}${exam === "Quiz"
                    ? termNumber
                    : ""
                    }(${maxMarks})\n${sub}`;

                subExamHeaders.push({
                    title: header,
                    examType: exam
                });
            });

            // Subject grand total
            subExamHeaders.push({
                title: "Total T-4",
                examType: "Total"
            });

            // Percentage (own column)
            subExamHeaders.push({
                title: `Per%${sub}`,
                examType: "Percentage"
            });

            // Grade (own column)
            subExamHeaders.push({
                title: `Grade-${sub}`,
                examType: "Grade"
            });
        });

        // -----------------------------------------
        // Main headers
        // -----------------------------------------

        const headers: string[] = [
            "S.No.",
            "Student Name",
            "Mother Name",
            "Father Name",
            "Address",
            "Class",
            "Date of Birth"
        ];

        headers.push(...subExamHeaders.map(h => h.title));

        // Overall totals across every subject (regular + single-mark),
        // placed right before the extra-data columns
        headers.push("Total Marks", "Year Grade", "Year %");

        headers.push(
            "Height (ft)",
            "Weight (Kg)",
            "Work Education",
            "Attendance",
            "Discipline",
            "Thinking Skill",
            "Remark"
        );

        // 1-based column index where the 3 overall-total columns start/end,
        // used below so header coloring doesn't try to look these up in
        // subExamHeaders (which only covers the subject columns)
        const overallTotalsStartCol = 8 + subExamHeaders.length;
        const overallTotalsEndCol = overallTotalsStartCol + 2;

        // Add header row
        const headerRow = worksheet.addRow(headers);

        headerRow.height = 50;

        // -----------------------------------------
        // Header styling
        // -----------------------------------------

        headerRow.eachCell((cell, colNumber) => {
            cell.font = {
                bold: true,
                color: { argb: "000000" }
            };

            cell.alignment = {
                vertical: "middle",
                horizontal: "center",
                wrapText: true
            };

            let backgroundColor = "D1D5DB";

            // First 7 columns
            if (colNumber <= 7) {
                backgroundColor = "D1D5DB";
            } else if (colNumber >= overallTotalsStartCol && colNumber <= overallTotalsEndCol) {
                // Total Marks / Year Grade / Year %
                backgroundColor = "FCD34D";
            } else if (colNumber > overallTotalsEndCol) {
                // Trailing extra-data columns (Height, Weight, etc.)
                backgroundColor = "E5E7EB";
            } else {
                const headerIndex = colNumber - 8;
                const headerInfo = subExamHeaders[headerIndex];

                if (headerInfo?.examType) {
                    backgroundColor =
                        EXAM_TYPE_EXCEL_COLORS[headerInfo.examType] ??
                        "E5E7EB";
                }

                // Total columns
                if (headerInfo?.examType === "Total") {
                    backgroundColor = "BFDBFE";
                }

                // Percentage columns
                if (headerInfo?.examType === "Percentage") {
                    backgroundColor = "FDE68A";
                }

                // Grade columns
                if (headerInfo?.examType === "Grade") {
                    backgroundColor = "DDD6FE";
                }
            }

            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: backgroundColor
                }
            };

            cell.border = {
                top: {
                    style: "thin",
                    color: { argb: "9CA3AF" }
                },
                bottom: {
                    style: "thin",
                    color: { argb: "9CA3AF" }
                },
                left: {
                    style: "thin",
                    color: { argb: "9CA3AF" }
                },
                right: {
                    style: "thin",
                    color: { argb: "9CA3AF" }
                }
            };
        });

        // -----------------------------------------
        // Student rows
        // -----------------------------------------

        studentsData.forEach((student, index) => {
            const studentExtra = extraData[student.sId];
            const rowData: (string | number)[] = [
                index + 1,
                student.studentName,
                student.motherName,
                student.fatherName,
                student.address,
                student.curClass,
                student.dob
            ];

            // Accumulates across every subject (regular + single-mark) to
            // produce Total Marks / Year Grade / Year %
            let overallTotal = 0;
            let overallMaxMarks = 0;

            subjects.forEach(sub => {
                let subTotal = 0;
                let subMaxMarks = 0;

                TERM_OPTIONS.forEach(term => {
                    let termTotal = 0;

                    EXAM_TYPE_OPTIONS.forEach(exam => {
                        const record = data.find(
                            d =>
                                d.sId === student.sId &&
                                d.examName === term &&
                                d.subjectId === sub &&
                                d.examType === exam
                        );

                        const marks = record?.marks ?? "";
                        const maxMarks = record?.maxMarks ?? "";

                        // Add marks to row
                        rowData.push(
                            marks === ""
                                ? ""
                                : Number(marks)
                        );

                        // Calculate term total
                        if (marks !== "") {
                            termTotal += Number(marks);
                        }

                        // Calculate subject max marks
                        if (maxMarks !== "") {
                            subMaxMarks += Number(maxMarks);
                        }
                    });

                    // Term total
                    rowData.push(termTotal);

                    subTotal += termTotal;
                });

                // -----------------------------------------
                // Subject total
                // -----------------------------------------

                rowData.push(subTotal);

                // -----------------------------------------
                // Percentage + Grade — now separate columns
                // -----------------------------------------

                const percentage =
                    subMaxMarks > 0
                        ? (subTotal / subMaxMarks) * 100
                        : 0;

                const grade = subMaxMarks > 0 ? gradeForPercentage(percentage) : "F";

                rowData.push(
                    subMaxMarks > 0 ? Number(percentage.toFixed(2)) : 0
                );
                rowData.push(grade);

                overallTotal += subTotal;
                overallMaxMarks += subMaxMarks;
            });


            singleExamSubjects.forEach(sub => {
                let subTotal = 0;
                let subMaxMarks = 0;

                TERM_OPTIONS.forEach(term => {
                    let termTotal = 0;

                    const exam = SINGLE_MARK_EXAM_TYPE;
                    const record = data.find(
                        d =>
                            d.sId === student.sId &&
                            d.examName === term &&
                            d.subjectId === sub &&
                            d.examType === exam
                    );

                    const marks = record?.marks ?? "";
                    const maxMarks = record?.maxMarks ?? "";

                    // Add marks to row
                    rowData.push(
                        marks === ""
                            ? ""
                            : Number(marks)
                    );

                    // Calculate term total
                    if (marks !== "") {
                        termTotal += Number(marks);
                    }

                    // Calculate subject max marks
                    if (maxMarks !== "") {
                        subMaxMarks += Number(maxMarks);
                    }

                    subTotal += termTotal;
                });

                // -----------------------------------------
                // Subject total
                // -----------------------------------------

                rowData.push(subTotal);

                // -----------------------------------------
                // Percentage + Grade — now separate columns
                // -----------------------------------------

                const percentage =
                    subMaxMarks > 0
                        ? (subTotal / subMaxMarks) * 100
                        : 0;

                const grade = subMaxMarks > 0 ? gradeForPercentage(percentage) : "F";

                rowData.push(
                    subMaxMarks > 0 ? Number(percentage.toFixed(2)) : 0
                );
                rowData.push(grade);

                overallTotal += subTotal;
                overallMaxMarks += subMaxMarks;
            });

            // -----------------------------------------
            // Total Marks / Year Grade / Year % — before Height, Weight, etc.
            // -----------------------------------------

            const overallPercentage =
                overallMaxMarks > 0 ? (overallTotal / overallMaxMarks) * 100 : 0;
            const overallGrade =
                overallMaxMarks > 0 ? gradeForPercentage(overallPercentage) : "F";

            rowData.push(
                overallTotal,
                overallGrade,
                overallMaxMarks > 0 ? Number(overallPercentage.toFixed(2)) : 0
            );

            rowData.push(
                studentExtra?.height ?? "",
                studentExtra?.weight ?? "",
                studentExtra?.workEducation ?? "",
                studentExtra?.attendance ?? "",
                studentExtra?.discipline ?? "",
                studentExtra?.thinkingSkill ?? "",
                studentExtra?.remark ?? ""
            );


            worksheet.addRow(rowData);
        });

        // -----------------------------------------
        // Style data rows
        // -----------------------------------------

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            row.eachCell((cell, colNumber) => {
                cell.alignment = {
                    vertical: "middle",
                    horizontal:
                        colNumber <= 7 ? "left" : "center",
                    wrapText: true
                };

                cell.border = {
                    top: {
                        style: "thin",
                        color: { argb: "D1D5DB" }
                    },
                    bottom: {
                        style: "thin",
                        color: { argb: "D1D5DB" }
                    },
                    left: {
                        style: "thin",
                        color: { argb: "D1D5DB" }
                    },
                    right: {
                        style: "thin",
                        color: { argb: "D1D5DB" }
                    }
                };
            });
        });

        // -----------------------------------------
        // Auto-size columns
        // -----------------------------------------

        worksheet.columns?.forEach(column => {
            if (!column) return;

            const col = column as ExcelJS.Column;

            let maxLength = 10;

            col.eachCell({ includeEmpty: true }, cell => {
                const value = cell.value
                    ? cell.value.toString()
                    : "";

                maxLength = Math.max(
                    maxLength,
                    value.length + 2
                );
            });

            col.width = Math.min(maxLength, 30);
        });

        // Make S.No. column smaller
        worksheet.getColumn(1).width = 8;

        // -----------------------------------------
        // Generate Excel file
        // -----------------------------------------

        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition":
                    `attachment; filename="export.xlsx"`
            }
        });
    } catch (err) {
        console.error(err);

        return new Response(
            JSON.stringify({
                error: "Internal Server Error"
            }),
            {
                status: 500
            }
        );
    }
}