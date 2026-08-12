import { NextRequest } from "next/server";
import ExcelJS from "exceljs";

type SalaryData = {
    name: string;
    empCode: string;
    totalDaysInMonth: string;
    present: string;
    totalLate: string;
    totalHD: string;
    absent: string;
    totalWO: string;
    totalPH: string;
    approvedCL: string;
    payableDays: string;
    basicSalary: string;
    halfDayDeduction: string;
    absentDeduction: string;
    totalDeduction: string;
    netSalary: string;
}

type ExcelRequestBody = {
    data: SalaryData[];
};


export async function POST(req: NextRequest) {
    try {
        const { data }: ExcelRequestBody = await req.json();

        if (!data || data.length === 0) {
            return new Response(JSON.stringify({ error: "No data provided" }), { status: 400 });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        const headers: string[] = ["Emp Name", "Emp Code", "Total Days in Month", "Present", "Total Late", "Total HD", "Absent", "Total W/O", "Total PH", "Approved CL", "Payable Days", "Basic Salary", "Half Day Deduction", "Absent Deduction", "Total Deduction (rounded)", "Net Salary"];

        // Add header row
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };

        // Add data rows
        data.forEach((item: SalaryData) => {
            worksheet.addRow([
                item.name,
                item.empCode,
                item.totalDaysInMonth,
                item.present,
                item.totalLate,
                item.totalHD,
                item.absent,
                item.totalWO,
                item.totalPH,
                item.approvedCL,
                item.payableDays,
                item.basicSalary,
                item.halfDayDeduction,
                item.absentDeduction,
                item.totalDeduction,
                item.netSalary
            ]);
        });

        // Auto-size columns
        worksheet.columns?.forEach((column) => {
            if (!column) return;
            const col = column as ExcelJS.Column;
            let maxLength = 10;
            col.eachCell({ includeEmpty: true }, (cell) => {
                const value = cell.value ? cell.value.toString() : "";
                maxLength = Math.max(maxLength, value.length + 2);
            });
            col.width = maxLength;
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="export.xlsx"`,
            },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
