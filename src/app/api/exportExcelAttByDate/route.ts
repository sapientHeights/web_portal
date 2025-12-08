import { NextRequest } from "next/server";
import ExcelJS from "exceljs";

type AttDataByDate = {
    name: string;
    class: string;
    section: string;
    attendance: string;
}

type ExcelRequestBody = {
  data: AttDataByDate[];
};


export async function POST(req: NextRequest) {
  try {
    const { data }: ExcelRequestBody = await req.json();

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: "No data provided" }), { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const headers: string[] = ["Student Name", "Class", "Section", "Attendance Status"];

    // Add header row
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };

    // Add data rows
    data.forEach((item : AttDataByDate) => {
        worksheet.addRow([
          item.name,
          item.class,
          item.section,
          item.attendance
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
