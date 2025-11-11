import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { FeeData, StudentPaymentReport } from "@/types/fee";

type ExcelRequestBody = {
  data: FeeData[] | StudentPaymentReport[];
};

// Type guard
function isStudentPaymentReport(item: unknown): item is StudentPaymentReport {
  return (
    typeof item === "object" &&
    item !== null &&
    "paymentMode" in item
  );
}

export async function POST(req: NextRequest) {
  try {
    const { data }: ExcelRequestBody = await req.json();

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: "No data provided" }), { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Determine headers dynamically
    let headers: string[] = [];
    if (isStudentPaymentReport(data[0])) {
      headers = ["Session Id", "Student Name", "Class", "Section", "Amount", "Payment Date", "Payment Mode", "Remark"];
    } else {
      headers = ["Session Id", "Student Name", "Class", "Section", "Fee", "Discount", "Paid"];
    }

    // Add header row
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };

    // Add data rows
    data.forEach((item : FeeData | StudentPaymentReport) => {
      if (isStudentPaymentReport(item)) {
        worksheet.addRow([
          item.sessionId,
          item.studentName,
          item.classId,
          item.section,
          item.amount,
          item.paymentDate,
          item.paymentMode,
          item.remark,
        ]);
      } else {
        worksheet.addRow([
          item.sessionId,
          item.studentName,
          item.classId,
          item.section,
          item.fee,
          item.discount,
          item.paid,
        ]);
      }
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
