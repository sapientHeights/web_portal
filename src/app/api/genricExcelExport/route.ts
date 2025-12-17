import { NextRequest } from "next/server";
import ExcelJS from "exceljs";

// Generic column type
type ExcelColumn<T> = {
  header: string; 
  key: keyof T;   
};

// Request body type
type ExcelRequestBody<T> = {
  data: T[];              
  columns: ExcelColumn<T>[]; 
  sheetName?: string;      
  fileName?: string;       
};

export async function POST(req: NextRequest) {
  try {
    // Parse JSON body
    const { data, columns, sheetName = "Sheet1", fileName = "export.xlsx" } =
      (await req.json()) as ExcelRequestBody<Record<string, unknown>>;

    if (!data || !columns || data.length === 0 || columns.length === 0) {
      return new Response(JSON.stringify({ error: "No data or columns provided" }), { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add headers dynamically
    const headerRow = worksheet.addRow(columns.map(col => col.header));
    headerRow.font = { bold: true };

    // Add data rows dynamically
    data.forEach(item => {
      const row = columns.map(col => item[col.key] ?? ""); 
      worksheet.addRow(row);
    });

    // Auto-size columns
    worksheet.columns?.forEach(column => {
      if (!column) return;
      const col = column as ExcelJS.Column;
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, cell => {
        const value = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, value.length + 2);
      });
      col.width = maxLength;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return response as Excel file
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
