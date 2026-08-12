'use client';

import Button from "@/components/ui/Button";
import FileUpload from "@/components/ui/FileUpload";
import FormFooterActions from "@/components/ui/FormFooterActions";
import FormSection from "@/components/ui/FormSection";
import FullPageLoader from "@/components/ui/FullPageLoader";
import { Camera, FileSpreadsheet, Settings2, Sheet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import InputField from "@/components/ui/InputField";
import SelectField from "./SelectField";
import { useSessions } from "@/hooks/useSessions";

/* ------------------------------------------------------------------ */
/*  Constants (per Attendance & Payroll Portal spec)                  */
/* ------------------------------------------------------------------ */

// Fixed grace window added to the (configurable) expected punch time.
// InTime <= punchTime            -> P
// punchTime < InTime <= +GRACE   -> L
// InTime > punchTime + GRACE     -> HD
const LATE_GRACE_MINUTES = 15;

// Default expected punch-in time shown in Settings; user can edit.
const DEFAULT_PUNCH_TIME = "07:25";

// Every 3 "Late" days converts to 1 Half Day (INT division).
const LATE_DAYS_PER_HALF_DAY = 3;

type TapInOut = {
    tapInOutExcel: File | null;
};

type EmployeeData = {
    empCode: string;
    name: string;
    days: string[];

    // expected punch-in time used for status calc, per day
    punchTime: string[];

    // raw values pulled straight from the uploaded sheet
    inTime: string[];
    outTime: string[];
    total: string[];
    sheetStatus: string[]; // status as it appears in the uploaded sheet - REFERENCE ONLY, not used in calculations

    // system-calculated status per day (the one actually driving payroll)
    calculatedStatus: string[];

    // how late (HH:MM) on days marked L or HD due to lateness
    lateBy: string[];
    totalLateDuration: string; // HH:MM, informational only

    // attendance summary (calculated)
    totalLateCount: number;       // count of days with calculated status 'L'
    actualHalfDay: number;        // count of days with calculated status 'HD'
    lateConvertedHalfDay: number; // INT(totalLateCount / 3)
    totalHalfDay: number;         // actualHalfDay + lateConvertedHalfDay
    totalPresentDays: number;     // count of 'P'
    totalAbsentDays: number;      // count of 'AB'
    weeklyOffs: number;           // count of 'W/O'
    publicHolidays: number;       // count of 'PH'
    approvedCLDays: number;       // count of 'CL'
    paidDays: number;             // P + W/O + PH + CL (display)

    // CL ledger (display only, does not affect salary)
    hasCLData: boolean; // false = no matching MaxLeaveData record found for this employee
    openingCL: number;
    monthlyEarnedCL: number;
    closingCL: number;

    // salary
    workingDays: number;
    monthlySalary: number;       // the actual matched salary used below - source of truth for display
    salaryMatchTier: 'exact' | 'loose' | 'none'; // which Employee Code match found this record
    perDaySalary: number;
    halfDayDeduction: number;
    absentDeduction: number;
    totalDeduction: number;
    netSalary: number;
};

type PunchTimeData = {
    sheetDay: string;
    punchTime: string;
}

type PublicHolidayData = {
    sheetDay: string;
    isHoliday: boolean;
}

type SundayData = {
    sheetDay: string;
    isSunday: boolean;
}

type LeaveData = {
    id: string;
    sessionId: string;
    tId: string;
    startDate: string;
    endDate: string;
    type: string;
    empId: string;
}

type MaxLeaveData = {
    id: string;
    sessionId: string;
    tId: string;
    maxCLs: number;
    usedCLs: number;
    empId: string;
}

type BasicSalaryData = {
    id: string;
    tId: string;
    salary: number | string; // API sends this as a string (e.g. "14145.00") despite being numeric - always Number() it before use
    installment: number;
    teacherName: string;
    empId: string | null;
}

type Props = {
    basicSalaryData: BasicSalaryData[] | null;
}

type ExcelRow = (string | number | boolean | null | undefined)[];

export default function SheetAnalysis({ basicSalaryData }: Props) {
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(false);
    const [tapInOutSheet, setTapInOutSheet] = useState<TapInOut>({
        tapInOutExcel: null
    });

    const [employees, setEmployees] = useState<EmployeeData[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const [punchTimeInput, setPunchTimeInput] = useState(false);
    const [sheetDays, setSheetDays] = useState<string[]>([]);
    const [defPunchTime, setDefPunchTime] = useState<string>(DEFAULT_PUNCH_TIME);
    const [punchTimeData, setPunchTimeData] = useState<PunchTimeData[]>([]);

    const [showEditIndPunchTime, setShowEditIndPunchTime] = useState(false);

    const [selectedSession, setSelectedSession] = useState('');

    const [publicHolidays, setPublicHolidays] = useState<PublicHolidayData[]>([]);
    const [showPublicHolidayEdit, setShowPublicHolidayEdit] = useState(false);

    const [sundays, setSundays] = useState<SundayData[]>([]);
    const [showSundayEdit, setShowSundayEdit] = useState(false);

    const [empMaxLeavesData, setEmpMaxLEavesData] = useState<MaxLeaveData[]>([]);

    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();

    const [empLeavesData, setEmpLeavesData] = useState<LeaveData[]>([]);

    const [salaryModalEmp, setSalaryModalEmp] = useState<EmployeeData | null>(null);

    const [sheetMonth, setSheetMonth] = useState('');
    const [sheetYear, setSheetYear] = useState('');

    const [showSaveModal, setShowSaveModal] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const file = e.target.files?.[0];

        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                toast.error("File Size exceeded 3MB");
                return;
            }

            setTapInOutSheet((prev) => ({
                ...prev,
                [name]: file
            }));

            setEmployees([]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setEmployees([]);

        const { name, value } = e.target;

        const updatedPunchData = sheetDays.map((day) => {
            const existing = punchTimeData.find(d => d.sheetDay === day);
            return {
                sheetDay: day,
                punchTime: existing ? (name === "defPunchTime" ? value : existing.punchTime) : value
            };
        });

        setDefPunchTime(value);
        setPunchTimeData(updatedPunchData);
    }

    const timeToMinutes = (time: string) => {
        if (!time) return 0;
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const minutesToTime = (minutes: number) => {
        if (minutes <= 0) return "0:00";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}:${m.toString().padStart(2, "0")}`;
    };

    // Calendar days in the selected month/year, e.g. July -> 31.
    // This is "Working Days" per the payroll spec - NOT the number of
    // day-columns found in the uploaded sheet.
    const getWorkingDaysInMonth = (month: number, year: number) => {
        if (!month || !year) return 0;
        return new Date(year, month, 0).getDate();
    };

    // Turns a sheet day label (e.g. "1", "12") into an actual Date using
    // the selected sheet month/year, so we can check it against approved
    // CL leave ranges.
    const getDateForDay = (day: string, month: number, year: number): Date | null => {
        const dayNum = parseInt(String(day).replace(/\D/g, ""), 10);
        if (!dayNum || !month || !year) return null;
        return new Date(year, month - 1, dayNum);
    };

    const isApprovedCLDay = (empCode: string, date: Date | null, leaves: LeaveData[]) => {
        if (!date) return false;
        return leaves.some(l => {
            if (l.empId != empCode || l.type !== "CL") return false;
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            return date >= start && date <= end;
        });
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        const file = tapInOutSheet.tapInOutExcel;

        if (!file) {
            toast.error("Upload file first");
            return;
        }

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const days = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                const isDaysRow = row.some(cell =>
                    String(cell).toLowerCase().includes("days")
                )

                if (isDaysRow) {
                    for (let j = 1; j < row.length; j++) {
                        const cellValue = row[j];

                        if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
                            const cell = String(cellValue).trim().toLowerCase();
                            days.push(cell);
                        }
                    }
                }
            }

            setSheetDays(days);

            const holidayDefaults = days.map(day => ({
                sheetDay: day,
                isHoliday: false
            }));
            setPublicHolidays(holidayDefaults);

            const sundayDefaults = days.map(day => ({
                sheetDay: day,
                isSunday: false
            }));
            setSundays(sundayDefaults);

            // Seed every day with the current default punch time so the
            // Punch Time row/calculation isn't blank until the user
            // manually touches the default punch time field.
            const punchTimeDefaults = days.map(day => ({
                sheetDay: day,
                punchTime: defPunchTime
            }));
            setPunchTimeData(punchTimeDefaults);
        }
        catch (err) {
            console.error(err);
            toast.error("Error reading file");
        }

        setPunchTimeInput(true);
    }

    const getMaxLeavesData = async () => {
        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getMaxLeavesBySess.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: selectedSession
                }),
            });

            const data = await res.json();
            if (data.error) {
                toast.error("Some error occurred");
            }
            else {
                if (!data.noData) {
                    setEmpMaxLEavesData(data.leavesData);
                }
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setPageLoading(false);
        }
    }

    const getLeavesData = async () => {
        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getLeavesDataBySess.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: selectedSession
                }),
            });

            const data = await res.json();
            if (data.error) {
                toast.error("Some error occurred");
            }
            else {
                if (!data.noData) {
                    setEmpLeavesData(data.leavesData);
                }
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setPageLoading(false);
        }
    }

    /**
     * Computes the system status for a single day, in priority order:
     *   1. Marked Public Holiday          -> PH
     *   2. Marked Sunday, no punch        -> W/O
     *   2b. Marked Sunday, punch present  -> P
     *   3. Falls inside an approved CL    -> CL
     *   4. Otherwise, by InTime vs the day's expected punch time:
     *        no punch                    -> AB
     *        InTime <= punchTime         -> P
     *        punchTime < InTime <= +15   -> L
     *        InTime > punchTime + 15     -> HD
     */
    const computeStatus = (
        day: string,
        inTime: string,
        punchTime: string,
        empCode: string,
        leaves: LeaveData[]
    ): string => {
        const isPH = publicHolidays.find(h => h.sheetDay === day)?.isHoliday;
        if (isPH) return "PH";

        const isSunday = sundays.find(s => s.sheetDay === day)?.isSunday;
        if (isSunday) {
            return inTime ? "P" : "W/O";
        }

        const dateForDay = getDateForDay(day, Number(sheetMonth), Number(sheetYear));
        if (isApprovedCLDay(empCode, dateForDay, leaves)) return "CL";

        if (!inTime) return "AB";

        const diff = timeToMinutes(inTime) - timeToMinutes(punchTime);
        if (diff <= 0) return "P";
        if (diff <= LATE_GRACE_MINUTES) return "L";
        return "HD";
    };

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();

        const file = tapInOutSheet.tapInOutExcel;

        if (!file) {
            toast.error("Upload file first");
            return;
        }

        await getMaxLeavesData();
        await getLeavesData();

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const parsedEmployees: EmployeeData[] = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];

                const isEmpRow = row.some(cell =>
                    String(cell).toLowerCase().includes("emp") &&
                    String(cell).toLowerCase().includes("code")
                );

                if (isEmpRow) {

                    let empCode = "";
                    let name = "";

                    for (let j = 0; j < row.length; j++) {
                        const cell = String(row[j]).toLowerCase();

                        if (cell.includes("emp") && cell.includes("code")) {
                            for (let k = j + 1; k < row.length; k++) {
                                if (row[k]) {
                                    empCode = String(row[k]);
                                    break;
                                }
                            }
                        }

                        if (cell.includes("emp") && cell.includes("name")) {
                            for (let k = j + 1; k < row.length; k++) {
                                if (row[k]) {
                                    name = String(row[k]);
                                    break;
                                }
                            }
                        }
                    }

                    const statusRow = rows[i + 1] || [];
                    const inRow = rows[i + 2] || [];
                    const outRow = rows[i + 3] || [];
                    const totalRow = rows[i + 4] || [];

                    const statusIndices = statusRow
                        .map((cell, idx) => (cell !== null && cell !== undefined && cell !== "" ? idx : -1))
                        .filter(idx => idx !== -1);

                    const getRowValues = (sourceRow: ExcelRow): string[] =>
                        statusIndices.map(idx => {
                            const val = sourceRow[idx];
                            return val !== null && val !== undefined ? String(val) : "";
                        });

                    const punchTime: string[] = [];
                    sheetDays.forEach((day) => {
                        const time = punchTimeData.find(d => d.sheetDay === day)?.punchTime;
                        punchTime.push(time || "");
                    })

                    parsedEmployees.push({
                        empCode,
                        name,
                        days: sheetDays,
                        punchTime: punchTime,
                        sheetStatus: getRowValues(statusRow).slice(1), // reference only
                        calculatedStatus: [],
                        inTime: getRowValues(inRow).slice(1),
                        outTime: getRowValues(outRow).slice(1),
                        total: getRowValues(totalRow).slice(1),
                        lateBy: [],
                        totalLateDuration: '00:00',
                        totalLateCount: 0,
                        actualHalfDay: 0,
                        lateConvertedHalfDay: 0,
                        totalHalfDay: 0,
                        totalPresentDays: 0,
                        totalAbsentDays: 0,
                        weeklyOffs: 0,
                        publicHolidays: 0,
                        approvedCLDays: 0,
                        paidDays: 0,
                        hasCLData: false,
                        openingCL: 0,
                        monthlyEarnedCL: 0,
                        closingCL: 0,
                        workingDays: 0,
                        monthlySalary: 0,
                        salaryMatchTier: 'none',
                        perDaySalary: 0,
                        halfDayDeduction: 0,
                        absentDeduction: 0,
                        totalDeduction: 0,
                        netSalary: 0
                    });

                    i += 4;
                }
            }

            if (parsedEmployees.length === 0) {
                toast.error("No employees found");
                return;
            }

            const workingDays = getWorkingDaysInMonth(Number(sheetMonth), Number(sheetYear));

            /* ---- Step 1: calculate status + attendance summary per day ---- */
            parsedEmployees.forEach((emp) => {
                let totalPresent = 0, totalLate = 0, totalAbsent = 0;
                let totalWO = 0, totalPH = 0, totalCL = 0, actualHalfDay = 0;
                let totalLateMinutes = 0;

                emp.calculatedStatus = emp.days.map((day, i) => {
                    const status = computeStatus(
                        day,
                        emp.inTime[i],
                        emp.punchTime[i],
                        emp.empCode,
                        empLeavesData
                    );

                    switch (status) {
                        case "P": totalPresent++; break;
                        case "L": totalLate++; break;
                        case "HD": actualHalfDay++; break;
                        case "AB": totalAbsent++; break;
                        case "W/O": totalWO++; break;
                        case "PH": totalPH++; break;
                        case "CL": totalCL++; break;
                    }

                    return status;
                });

                // Late-by duration, only meaningful for days marked L or HD
                emp.lateBy = emp.calculatedStatus.map((status, i) => {
                    if (status !== "L" && status !== "HD") return "00:00";
                    const diff = timeToMinutes(emp.inTime[i]) - timeToMinutes(emp.punchTime[i]);
                    if (diff > 0) totalLateMinutes += diff;
                    return diff > 0 ? minutesToTime(diff) : "00:00";
                });

                const lateConvertedHalfDay = Math.floor(totalLate / LATE_DAYS_PER_HALF_DAY);
                const totalHalfDay = actualHalfDay + lateConvertedHalfDay;

                emp.totalPresentDays = totalPresent;
                emp.totalLateCount = totalLate;
                emp.actualHalfDay = actualHalfDay;
                emp.lateConvertedHalfDay = lateConvertedHalfDay;
                emp.totalHalfDay = totalHalfDay;
                emp.totalAbsentDays = totalAbsent;
                emp.weeklyOffs = totalWO;
                emp.publicHolidays = totalPH;
                emp.approvedCLDays = totalCL;
                emp.paidDays = totalPresent + totalWO + totalPH + totalCL;

                const h = Math.floor(totalLateMinutes / 60);
                const m = totalLateMinutes % 60;
                emp.totalLateDuration = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            });

            /* ---- Step 2: CL ledger (display only) ---- */
            parsedEmployees.forEach((emp) => {
                // NOTE: with only a single `empId` field available on
                // MaxLeaveData, we can't distinguish a running yearly
                // balance from a month-specific one - this is a best
                // effort display based on the data currently exposed.
                const empMax = empMaxLeavesData.find(e => e.empId == emp.empCode);
                const monthlyEarnedCL = 1;

                emp.hasCLData = !!empMax;
                emp.openingCL = empMax ? Math.max(0, empMax.maxCLs - empMax.usedCLs) : 0;
                emp.monthlyEarnedCL = monthlyEarnedCL;
                emp.closingCL = empMax
                    ? Math.max(0, emp.openingCL + monthlyEarnedCL - emp.approvedCLDays)
                    : 0;
            });

            /* ---- Step 3: salary ---- */
            parsedEmployees.forEach((emp) => {
                // Priority 1: exact Employee Code match.
                // Priority 2: loose (trimmed/case-insensitive) match, as a
                // stand-in for a separate "Employee ID" field - the current
                // data model only exposes a single `empId` per record.
                // NOTE: basicSalaryData.salary can arrive as a string from
                // the API (e.g. "14145.00") despite the TS type saying
                // number - always coerce with Number() before using it.
                let matchedRecord = basicSalaryData?.find(bs => bs.empId != null && bs.empId == emp.empCode);
                let matchTier: 'exact' | 'loose' | 'none' = matchedRecord ? 'exact' : 'none';

                if (!matchedRecord) {
                    matchedRecord = basicSalaryData?.find(
                        bs => bs.empId != null && String(bs.empId).trim().toLowerCase() === String(emp.empCode).trim().toLowerCase()
                    );
                    if (matchedRecord) matchTier = 'loose';
                }

                const basicSalary = matchedRecord ? Number(matchedRecord.salary) : undefined;

                emp.workingDays = workingDays;
                emp.salaryMatchTier = matchTier;
                emp.monthlySalary = basicSalary ?? 0;

                if (basicSalary === undefined || !Number.isFinite(basicSalary) || !workingDays) {
                    emp.netSalary = 0;
                    return;
                }

                const perDaySalary = basicSalary / workingDays;
                const halfDayDeduction = (perDaySalary / 2) * emp.totalHalfDay;
                const absentDeduction = perDaySalary * emp.totalAbsentDays;
                const totalDeduction = Math.round(halfDayDeduction + absentDeduction);
                const netSalary = Math.round(basicSalary - totalDeduction);

                emp.perDaySalary = perDaySalary;
                emp.halfDayDeduction = halfDayDeduction;
                emp.absentDeduction = absentDeduction;
                emp.totalDeduction = totalDeduction;
                emp.netSalary = netSalary;
            });

            setEmployees(parsedEmployees);
            toast.success("Analysis Completed");

        } catch (err) {
            console.error(err);
            toast.error("Error reading file");
        }
    };

    const handleResetToDefPunchTime = () => {
        const updated = punchTimeData.map(item => ({
            ...item,
            punchTime: defPunchTime
        }));

        setPunchTimeData(updated);

        toast.success("Reset completed");
    }

    const handleIndividualPunchTime = () => {
        setShowPublicHolidayEdit(false);
        setShowSundayEdit(false);

        if (punchTimeData.length === 0 || (punchTimeData[0].punchTime === '')) {
            toast.error("Please select the default punch time first");
            return;
        }

        setShowEditIndPunchTime(prev => !prev);
    }

    const handleIndividualPublicHoliday = () => {
        setShowEditIndPunchTime(false);
        setShowSundayEdit(false);
        setShowPublicHolidayEdit(prev => !prev)
    }

    const handleIndividualSunday = () => {
        setShowEditIndPunchTime(false);
        setShowPublicHolidayEdit(false);
        setShowSundayEdit(prev => !prev);
    }

    const handleIndividualChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        sheetDay: string
    ) => {
        const { value } = e.target;

        const updated = punchTimeData.map(item =>
            item.sheetDay === sheetDay
                ? { ...item, punchTime: value }
                : item
        );

        setPunchTimeData(updated);
    };

    const handleHolidayChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        sheetDay: string
    ) => {
        const updated = publicHolidays.map(item =>
            item.sheetDay === sheetDay
                ? { ...item, isHoliday: e.target.checked }
                : item
        );

        setPublicHolidays(updated);
        setEmployees([]);
    };

    const resetHolidays = () => {
        setPublicHolidays(prev =>
            prev.map(item => ({ ...item, isHoliday: false }))
        );
        setEmployees([]);
        toast.success("Reset completed");
    };

    const handleSundayChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        sheetDay: string
    ) => {
        const updated = sundays.map(item =>
            item.sheetDay === sheetDay
                ? { ...item, isSunday: e.target.checked }
                : item
        );

        setSundays(updated);
        setEmployees([]);
    };

    const resetSundays = () => {
        setSundays(prev =>
            prev.map(item => ({ ...item, isSunday: false }))
        );
        setEmployees([]);
        toast.success("Reset completed");
    };

    const handleSessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSession(e.target.value);
        setEmployees([]);
    }

    const handleFieldValuesChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "sheetMonth") {
            setSheetMonth(value);
        }
        if (name === "sheetYear") {
            setSheetYear(value);
        }
        setEmployees([]);
    }

    const handleSaveAllDataModal = () => {
        if (employees.length === 0) {
            toast.error("No data to save");
            return;
        }
        setShowSaveModal(true);
    }

    const handleSaveAllData = async () => {
        const salaryData = employees.map(d => ({
            empCode: d.empCode,
            name: d.name,
            totalPresentDays: d.totalPresentDays,
            totalAbsentDays: d.totalAbsentDays,
            weeklyOffs: d.weeklyOffs,
            publicHolidays: d.publicHolidays,
            approvedCLDays: d.approvedCLDays,
            actualHalfDay: d.actualHalfDay,
            lateConvertedHalfDay: d.lateConvertedHalfDay,
            totalHalfDay: d.totalHalfDay,
            paidDays: d.paidDays,
            workingDays: d.workingDays,
            perDaySalary: d.perDaySalary,
            halfDayDeduction: d.halfDayDeduction,
            absentDeduction: d.absentDeduction,
            totalDeduction: d.totalDeduction,
            netSalary: d.netSalary
        }))

        setPageLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/saveAllEmpSalaryData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    salaryData
                }),
            });

            const data = await res.json();
            if (!data.error) {
                toast.success("Data Saved");
                setShowSaveModal(false);
            }
            else {
                toast.error("Failed to save data");
            }
        }
        catch (err) {
            toast.error("Some error occurred");
            console.error(err);
        }
        finally {
            setPageLoading(false);
        }
    }

    const loading = pageLoading || sessionsLoading;

    if (loading) return <FullPageLoader />;

    const fmtCurrency = (val: number) => {
        const n = Number(val);
        return `₹${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
    };

    return (
        <>
            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10">
                <form onSubmit={handleFileUpload}>
                    <FormSection title="Upload Excel" icon={<FileSpreadsheet />} margin={false}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FileUpload
                                label="File"
                                name="tapInOutExcel"
                                onChange={handleFileChange}
                                icon={<Camera />}
                                files={tapInOutSheet}
                                required
                                accept=".xlsx,.xls"
                            />
                        </div>

                        <FormFooterActions primaryLabel="Preview" />
                    </FormSection>
                </form>
            </div>

            {punchTimeInput && (
                <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10">
                    <form onSubmit={handlePreview}>
                        <FormSection title="Settings" icon={<Settings2 />} margin={false}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField
                                    type="time"
                                    label="Default Punch Time (expected In Time)"
                                    name="defPunchTime"
                                    value={defPunchTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                On time up to this value. Late window is a fixed {LATE_GRACE_MINUTES} minutes after this time; beyond that counts as a Half Day.
                            </p>

                            <div className="text-sm mt-2 flex gap-6 flex-wrap">
                                <Button type="button" text={showEditIndPunchTime ? 'Hide Individual Punch Time' : 'Edit Individual Punch Time'} icon={<></>} onClick={handleIndividualPunchTime} setGreen={!showEditIndPunchTime} />
                                <Button type="button" text={showPublicHolidayEdit ? 'Hide Public Holidays' : 'Mark Public Holidays'} onClick={handleIndividualPublicHoliday} icon={<></>} setGreen={!showPublicHolidayEdit} />
                                <Button type="button" text={showSundayEdit ? 'Hide Sundays' : 'Mark Sundays'} onClick={handleIndividualSunday} icon={<></>} setGreen={!showSundayEdit} />
                            </div>

                            {showEditIndPunchTime && (
                                <div className="flex flex-col gap-5">
                                    <div className="overflow-auto h-64 grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                                        {punchTimeData.map((item) => (
                                            <InputField
                                                key={item.sheetDay}
                                                type="time"
                                                label={item.sheetDay}
                                                name={item.sheetDay}
                                                value={item.punchTime}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => handleIndividualChange(e, item.sheetDay)}
                                            />
                                        ))}
                                    </div>
                                    <Button type="button" text="Reset all to default" icon={<></>} onClick={handleResetToDefPunchTime} setGreen />
                                </div>
                            )}

                            {showPublicHolidayEdit && (
                                <div className="flex flex-col gap-5">
                                    <div className="overflow-auto h-64 grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                                        {publicHolidays.map((item) => (
                                            <label key={item.sheetDay} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isHoliday}
                                                    onChange={(e) => handleHolidayChange(e, item.sheetDay)}
                                                />
                                                {item.sheetDay}
                                            </label>
                                        ))}
                                    </div>
                                    <Button type="button" text="Reset all to default" icon={<></>} onClick={resetHolidays} setGreen />
                                </div>
                            )}

                            {showSundayEdit && (
                                <div className="flex flex-col gap-5">
                                    <div className="overflow-auto h-64 grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                                        {sundays.map((item) => (
                                            <label key={item.sheetDay} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isSunday}
                                                    onChange={(e) => handleSundayChange(e, item.sheetDay)}
                                                />
                                                {item.sheetDay}
                                            </label>
                                        ))}
                                    </div>
                                    <Button type="button" text="Reset all to default" icon={<></>} onClick={resetSundays} setGreen />
                                </div>
                            )}

                            <div className="grid grid-cols-1 mt-5 md:grid-cols-3 gap-4">
                                <SelectField label="Select Session" name="sessionId" value={selectedSession} onChange={handleSessChange} options={sessions} required />
                                <SelectField label="Enter Sheet Month Number" name="sheetMonth" value={sheetMonth} onChange={handleFieldValuesChange} options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]} required />
                                <InputField label="Enter Sheet Year (xxxx)" name="sheetYear" value={sheetYear} onChange={handleFieldValuesChange} required />
                            </div>

                            <FormFooterActions primaryLabel="Execute" />
                        </FormSection>
                    </form>
                </div>
            )}

            {punchTimeInput && employees.length > 0 && (
                <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
                    <FormSection title="Employees" icon={<Sheet />} margin={false}>
                        <div className="h-96 overflow-auto">
                            {employees.map((emp, index) => (
                                <div key={index} className="border rounded mb-4">

                                    {/* HEADER */}
                                    <div
                                        className="p-3 bg-gray-100 cursor-pointer flex justify-between items-center"
                                        onClick={() =>
                                            setExpandedIndex(expandedIndex === index ? null : index)
                                        }
                                    >
                                        <div className="flex justify-between items-center w-full flex-col sm:flex-row">
                                            <span>
                                                {emp.name} (Emp Code: {emp.empCode})
                                            </span>
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-auto mr-3 flex-col sm:flex-row">
                                                <span className="relative text-white rounded-full px-3 py-1 text-sm font-semibold bg-linear-to-br from-amber-400 via-amber-500 to-amber-700 shadow-md">
                                                    Late Days: {emp.totalLateCount} ({emp.totalLateDuration})
                                                </span>

                                                <span className="text-sm text-white px-3 py-1 rounded-full font-semibold bg-linear-to-br from-purple-400 via-purple-500 to-purple-700 shadow-md">
                                                    Total Half Days: {emp.totalHalfDay}
                                                </span>

                                                <button
                                                    onClick={(evt) => { evt.stopPropagation(); setSalaryModalEmp(emp); }}
                                                    className="ml-2 px-3 py-1 text-sm font-semibold rounded-full text-white bg-linear-to-br from-green-400 via-green-500 to-green-700 shadow-md cursor-pointer"
                                                >
                                                    Salary Calculation
                                                </button>
                                            </div>

                                        </div>
                                        <span>
                                            {expandedIndex === index ? "▲" : "▼"}
                                        </span>
                                    </div>

                                    {/* DROPDOWN */}
                                    {expandedIndex === index && (
                                        <div className="p-3 overflow-auto">

                                            <table className="table-auto border w-full text-xs">
                                                <tbody>

                                                    <tr>
                                                        <td className="border px-2 py-1 font-bold h-10">Days</td>
                                                        {emp.days.map((val, i) => (
                                                            <td key={i} className="border px-2">{val}</td>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td className="border px-2 py-1 font-bold h-10">Punch Time</td>
                                                        {emp.punchTime.map((val, i) => (
                                                            <td key={i} className="border px-2">{val}</td>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td className="border px-2 py-1 font-bold h-10" title="As found in the uploaded sheet - reference only, not used in calculations">
                                                            Sheet Status (ref.)
                                                        </td>
                                                        {emp.sheetStatus.map((val, i) => (
                                                            <td key={i} className="border px-2 text-gray-400">{val}</td>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td className="border px-2 py-1 font-bold h-10 bg-blue-50" title="Computed by the system - this is what drives payroll">
                                                            Calculated Status
                                                        </td>
                                                        {emp.calculatedStatus.map((val, i) => (
                                                            <td
                                                                key={i}
                                                                className={`border px-2 font-semibold ${val === 'HD' ? 'bg-purple-500 text-white border-black' :
                                                                        val === 'AB' ? 'bg-red-500 text-white border-black' :
                                                                            val === 'L' ? 'bg-amber-500 text-white border-black' :
                                                                                val === 'CL' ? 'bg-blue-400 text-white border-black' :
                                                                                    val === 'PH' ? 'bg-teal-400 text-white border-black' :
                                                                                        val === 'W/O' ? 'bg-gray-400 text-white border-black' :
                                                                                            'bg-blue-50'
                                                                    }`}
                                                            >
                                                                {val}
                                                            </td>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td className="border px-2 py-1 font-bold h-10">In</td>
                                                        {emp.inTime.map((val, i) => (
                                                            <td key={i} className="border px-2">{val}</td>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td className="border px-2 py-1 font-bold h-10">Out</td>
                                                        {emp.outTime.map((val, i) => (
                                                            <td key={i} className="border px-2">{val}</td>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td className="border px-2 py-1 font-bold h-10">Total</td>
                                                        {emp.total.map((val, i) => (
                                                            <td key={i} className="border px-2">{val}</td>
                                                        ))}
                                                    </tr>

                                                    <tr>
                                                        <td className="border px-2 py-1 font-bold h-10">Late By</td>
                                                        {emp.lateBy.map((val, i) => (
                                                            <td key={i} className={`border px-2 ${val != "00:00" ? 'bg-amber-500 text-white border-black' : ''}`}>{val}</td>
                                                        ))}
                                                    </tr>

                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                            ))}
                        </div>

                        <div className="mt-2">
                            <Button type="button" text="Save All Data" icon={<></>} onClick={handleSaveAllDataModal} setGreen />
                        </div>

                    </FormSection>

                    {salaryModalEmp && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

                            <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl p-6 relative">

                                {/* Close Button */}
                                <button
                                    onClick={() => setSalaryModalEmp(null)}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl cursor-pointer"
                                >
                                    ✕
                                </button>

                                {/* Header */}
                                <h2 className="text-xl font-semibold mb-1 text-gray-800">
                                    Salary Breakdown
                                </h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    {salaryModalEmp.name} (Emp Code: {salaryModalEmp.empCode})
                                </p>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                    {/* LEFT: attendance summary + CL ledger */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Attendance Summary</h3>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-sm mb-5">
                                            <div className="p-2 bg-gray-100 rounded-lg text-center">
                                                <p className="text-gray-500 text-xs">Present</p>
                                                <p className="font-bold">{salaryModalEmp.totalPresentDays}</p>
                                            </div>
                                            <div className="p-2 bg-amber-50 rounded-lg text-center">
                                                <p className="text-gray-500 text-xs">Late</p>
                                                <p className="font-bold">{salaryModalEmp.totalLateCount}</p>
                                            </div>
                                            <div className="p-2 bg-purple-50 rounded-lg text-center">
                                                <p className="text-gray-500 text-xs">Actual HD</p>
                                                <p className="font-bold">{salaryModalEmp.actualHalfDay}</p>
                                            </div>
                                            <div className="p-2 bg-purple-50 rounded-lg text-center">
                                                <p className="text-gray-500 text-xs">Late Conv. HD</p>
                                                <p className="font-bold">{salaryModalEmp.lateConvertedHalfDay}</p>
                                            </div>
                                            <div className="p-2 bg-purple-100 rounded-lg text-center">
                                                <p className="text-gray-500 text-xs">Total HD</p>
                                                <p className="font-bold">{salaryModalEmp.totalHalfDay}</p>
                                            </div>
                                            <div className="p-2 bg-red-50 rounded-lg text-center">
                                                <p className="text-gray-500 text-xs">Absent</p>
                                                <p className="font-bold">{salaryModalEmp.totalAbsentDays}</p>
                                            </div>
                                            <div className="p-2 bg-gray-100 rounded-lg text-center">
                                                <p className="text-gray-500 text-xs">W/O</p>
                                                <p className="font-bold">{salaryModalEmp.weeklyOffs}</p>
                                            </div>
                                            <div className="p-2 bg-teal-50 rounded-lg text-center">
                                                <p className="text-gray-500 text-xs">PH</p>
                                                <p className="font-bold">{salaryModalEmp.publicHolidays}</p>
                                            </div>
                                            <div className="p-2 bg-blue-50 rounded-lg text-center">
                                                <p className="text-gray-500 text-xs">Approved CL</p>
                                                <p className="font-bold">{salaryModalEmp.approvedCLDays}</p>
                                            </div>
                                            <div className="p-2 bg-amber-100 rounded-lg text-center col-span-3 sm:col-span-1">
                                                <p className="text-gray-500 text-xs">Paid Days</p>
                                                <p className="font-bold">{salaryModalEmp.paidDays}</p>
                                            </div>
                                        </div>

                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">CL Ledger</h3>
                                        {salaryModalEmp.hasCLData ? (
                                            <div className="grid grid-cols-4 gap-2 text-sm">
                                                <div className="p-2 bg-blue-50 rounded-lg text-center">
                                                    <p className="text-gray-500 text-xs">Opening</p>
                                                    <p className="font-bold">{salaryModalEmp.openingCL}</p>
                                                </div>
                                                <div className="p-2 bg-blue-50 rounded-lg text-center">
                                                    <p className="text-gray-500 text-xs">Earned</p>
                                                    <p className="font-bold">+{salaryModalEmp.monthlyEarnedCL}</p>
                                                </div>
                                                <div className="p-2 bg-blue-50 rounded-lg text-center">
                                                    <p className="text-gray-500 text-xs">Availed</p>
                                                    <p className="font-bold">-{salaryModalEmp.approvedCLDays}</p>
                                                </div>
                                                <div className="p-2 bg-blue-100 rounded-lg text-center">
                                                    <p className="text-gray-500 text-xs">Closing</p>
                                                    <p className="font-bold">{salaryModalEmp.closingCL}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic p-2 bg-gray-50 rounded-lg">
                                                No CL record found for this employee for the selected session.
                                            </p>
                                        )}
                                    </div>

                                    {/* RIGHT: step by step calculation */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Calculation Steps</h3>
                                        <div className="border rounded-lg divide-y text-sm mb-5">
                                            <div className="p-3 flex justify-between">
                                                <span className="text-gray-600">1. Working Days (days in month)</span>
                                                <span className="font-semibold">{salaryModalEmp.workingDays}</span>
                                            </div>
                                            <div className="p-3 flex justify-between">
                                                <span className="text-gray-600">2. Monthly Salary</span>
                                                <span className="text-right">
                                                    <span className="font-semibold">{fmtCurrency(salaryModalEmp.monthlySalary)}</span>
                                                    {salaryModalEmp.salaryMatchTier === 'loose' && (
                                                        <span className="block text-xs text-amber-600">matched via loose Employee Code match</span>
                                                    )}
                                                    {salaryModalEmp.salaryMatchTier === 'none' && (
                                                        <span className="block text-xs text-red-500">no salary record found</span>
                                                    )}
                                                </span>
                                            </div>
                                            {salaryModalEmp.monthlySalary > 500000 && (
                                                <div className="p-2 bg-red-50 text-xs text-red-600">
                                                    ⚠ This salary looks unusually high - please double check the source record for Emp Code {salaryModalEmp.empCode} in Basic Salary Setup.
                                                </div>
                                            )}
                                            <div className="p-3 flex justify-between">
                                                <span className="text-gray-600">3. Per Day Salary = Monthly Salary / Working Days</span>
                                                <span className="font-semibold">{fmtCurrency(salaryModalEmp.perDaySalary)}</span>
                                            </div>
                                            <div className="p-3 flex justify-between">
                                                <span className="text-gray-600">4. Half Day Deduction = (Per Day Salary / 2) × {salaryModalEmp.totalHalfDay} HD</span>
                                                <span className="font-semibold text-red-600">- {fmtCurrency(salaryModalEmp.halfDayDeduction)}</span>
                                            </div>
                                            <div className="p-3 flex justify-between">
                                                <span className="text-gray-600">5. Absent Deduction = Per Day Salary × {salaryModalEmp.totalAbsentDays} AB</span>
                                                <span className="font-semibold text-red-600">- {fmtCurrency(salaryModalEmp.absentDeduction)}</span>
                                            </div>
                                            <div className="p-3 flex justify-between bg-red-50">
                                                <span className="text-gray-700 font-medium">6. Total Deduction (rounded)</span>
                                                <span className="font-bold text-red-700">- ₹{salaryModalEmp.totalDeduction}</span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-green-50 rounded-lg text-center">
                                            <p className="text-gray-500 text-sm">Net Salary (Monthly Salary − Total Deduction, rounded)</p>
                                            <p className="text-2xl font-bold text-green-700">
                                                ₹{salaryModalEmp.netSalary}
                                            </p>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    )}

                    {showSaveModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

                            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-6 relative">

                                {/* Close Button */}
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl cursor-pointer"
                                >
                                    ✕
                                </button>

                                {/* Header */}
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                    Save Employees Salary Data
                                </h2>

                                {/* Table */}
                                <div className="overflow-auto max-h-96 border rounded-lg">
                                    <table className="w-full text-sm border ">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="border px-3 py-2 text-left">Emp Name</th>
                                                <th className="border px-3 py-2 text-left">Emp Code</th>
                                                <th className="border px-3 py-2 text-center">Present</th>
                                                <th className="border px-3 py-2 text-center">Total HD</th>
                                                <th className="border px-3 py-2 text-center">Absent</th>
                                                <th className="border px-3 py-2 text-center">Paid Days</th>
                                                <th className="border px-3 py-2 text-center">Net Salary</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map((emp, index) => (
                                                <tr key={index}>
                                                    <td className="border px-3 py-2">{emp.name}</td>
                                                    <td className="border px-3 py-2">{emp.empCode}</td>
                                                    <td className="border px-3 py-2 text-center">
                                                        {emp.totalPresentDays}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        {emp.totalHalfDay}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        {emp.totalAbsentDays}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        {emp.paidDays}
                                                    </td>
                                                    <td className="border px-3 py-2 text-center">
                                                        ₹ {emp.netSalary}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* <div className="mt-5 flex justify-end">
                                    <Button type="button" text="Confirm & Save" icon={<></>} setGreen onClick={handleSaveAllData} />
                                </div> */}

                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}