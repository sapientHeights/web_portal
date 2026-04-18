'use client';

import Button from "@/components/ui/Button";
import FileUpload from "@/components/ui/FileUpload";
import FormFooterActions from "@/components/ui/FormFooterActions";
import FormSection from "@/components/ui/FormSection";
import FullPageLoader from "@/components/ui/FullPageLoader";
import { Camera, FileSpreadsheet, IndianRupee, Settings2, Sheet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import InputField from "@/components/ui/InputField";
import SelectField from "./SelectField";
import { useSessions } from "@/hooks/useSessions";

type TapInOut = {
    tapInOutExcel: File | null;
};

type EmployeeData = {
    empCode: string;
    name: string;
    days: string[];
    punchTime: string[];
    status: string[];
    inTime: string[];
    outTime: string[];
    total: string[];
    lateBy: string[];
    totalLate: string;
    halfDays: number;
    halfDayFlags: boolean[];
    totalPresentDays: number;
    publicHolidays: number;
    reqCasualLeaves: number;
    reqLeavesWithoutPay: number;
    totalPayableDays: number;
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

type LeaveData = {
    id: string;
    sessionId: string;
    tId: string;
    startDate: string;
    endDate: string;
    type: string;
}

type MaxLeaveData = {
    id: string;
    sessionId: string;
    tId: string;
    maxCLs: number;
    maxLWPs: number;
    usedCLs: number;
    usedLWPs: number;
}

type BasicSalaryData = {
    id: string;
    tId: string;
    salary: number;
    installment: number;
    teacherName: string;
    empId: string;
}

type Props = {
    basicSalaryData: BasicSalaryData[] | null;
}

type ExcelRow = (string | number | boolean | null | undefined)[];

export default function SheetAnalysis({basicSalaryData} : Props) {
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(false);
    const [tapInOutSheet, setTapInOutSheet] = useState<TapInOut>({
        tapInOutExcel: null
    });

    const [employees, setEmployees] = useState<EmployeeData[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const [punchTimeInput, setPunchTimeInput] = useState(false);
    const [sheetDays, setSheetDays] = useState<string[]>([]);
    const [defPunchTime, setDefPunchTime] = useState<string>('');
    const [punchTimeData, setPunchTimeData] = useState<PunchTimeData[]>([]);

    const [showEditIndPunchTime, setShowEditIndPunchTime] = useState(false);

    const [maxLateDays, setMaxLateDays] = useState(3);
    const [lateThreshold, setLateThreshold] = useState(45);

    const [halfDayCriteria, setHalfDayCriteria] = useState('Days');
    const [selectedSession, setSelectedSession] = useState('');

    const [publicHolidays, setPublicHolidays] = useState<PublicHolidayData[]>([]);
    const [showPublicHolidayEdit, setShowPublicHolidayEdit] = useState(false);

    const [empMaxLeavesData, setEmpMaxLEavesData] = useState<MaxLeaveData[]>([]);

    const { sessions, isLoading: sessionsLoading, activeSession } = useSessions();

    const [empLeavesData, setEmpLeavesData] = useState<LeaveData[]>([]);

    const [salaryModalEmp, setSalaryModalEmp] = useState<EmployeeData | null>(null);

    const [sheetMonth, setSheetMonth] = useState('');
    const [sheetYear, setSheetYear] = useState('');

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

        const updatedPunchData = sheetDays.map((day, index) => {
            const existing = punchTimeData.find(d => d.sheetDay === day);
            return {
                sheetDay: day,
                punchTime: existing ? (name === "defPunchTime" ? value : existing.punchTime) : value
            };
        });

        setDefPunchTime(value);
        setPunchTimeData(updatedPunchData);
        console.log(updatedPunchData);
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

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();

        const file = tapInOutSheet.tapInOutExcel;

        if (!file) {
            toast.error("Upload file first");
            return;
        }

        getMaxLeavesData();
        getLeavesData();
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
                                    // empCode = row[k];
                                    empCode = String(row[k]);
                                    break;
                                }
                            }
                        }

                        if (cell.includes("emp") && cell.includes("name")) {
                            for (let k = j + 1; k < row.length; k++) {
                                if (row[k]) {
                                    // name = row[k];
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
                        status: getRowValues(statusRow).slice(1),
                        inTime: getRowValues(inRow).slice(1),
                        outTime: getRowValues(outRow).slice(1),
                        total: getRowValues(totalRow).slice(1),
                        lateBy: [],
                        totalLate: '',
                        halfDays: 0,
                        halfDayFlags: [],
                        totalPresentDays: 0,
                        publicHolidays: 0,
                        reqCasualLeaves: 0,
                        reqLeavesWithoutPay: 0,
                        totalPayableDays: 0,
                        netSalary: 0
                    });

                    i += 4;
                }
            }

            if (parsedEmployees.length === 0) {
                toast.error("No employees found");
                return;
            }

            parsedEmployees.forEach((emp) => {
                let totalPresents = 0;
                let publicHolidaysCount = 0;
                emp.lateBy = emp.status.map((status, i) => {
                    const isHoliday = publicHolidays.find(
                        h => h.sheetDay === emp.days[i]
                    )?.isHoliday;
                    if (status == 'P' && !isHoliday) {
                        totalPresents += 1;

                        const inTime = emp.inTime[i];
                        const punch = emp.punchTime[i];

                        if (inTime && punch) {
                            const diff = timeToMinutes(inTime) - timeToMinutes(punch);
                            return diff > 0 ? minutesToTime(diff) : '00:00';
                        }
                    }

                    if (isHoliday) publicHolidaysCount += 1;

                    return '00:00';
                });

                emp.totalPresentDays = totalPresents;
                emp.publicHolidays = publicHolidaysCount;
                emp.totalLate = calTotalLate(emp);
            });

            parsedEmployees.forEach((emp) => {
                let totalMinutes = 0;
                let lateDaysCount = 0;

                emp.halfDayFlags = [];
                emp.halfDays = 0;

                emp.lateBy.forEach((late, i) => {
                    const isLate = late !== "00:00";

                    if (isLate) {
                        const [h, m] = late.split(":").map(Number);
                        const mins = h * 60 + m;

                        totalMinutes += mins;
                        lateDaysCount++;

                        if ((halfDayCriteria === 'Days' && lateDaysCount > maxLateDays) || (halfDayCriteria === 'Minutes' && totalMinutes > lateThreshold)) {
                            emp.halfDayFlags[i] = true;
                            // emp.halfDays += 0.5;
                            emp.halfDays += 1;
                        } else {
                            emp.halfDayFlags[i] = false;
                        }
                    } else {
                        emp.halfDayFlags[i] = false;
                    }
                });

                emp.totalLate = calTotalLate(emp);
            });

            parsedEmployees.forEach((emp) => {
                const empLeaves = empLeavesData.filter(
                    l => l.tId === emp.empCode && l.type === "CL"
                );

                const currentMonth = Number(sheetMonth); // TODO: dynamic
                const currentYear = Number(sheetYear);

                const getMonthYear = (month: number, year: number, offset: number) => {
                    const date = new Date(year, month - 1 + offset);
                    return {
                        month: date.getMonth() + 1,
                        year: date.getFullYear()
                    };
                };

                const prev = getMonthYear(currentMonth, currentYear, -1);
                const curr = { month: currentMonth, year: currentYear };
                const next = getMonthYear(currentMonth, currentYear, 1);

                const isCLUsedInMonth = (month: number, year: number) => {
                    return empLeaves.some(leave => {
                        const start = new Date(leave.startDate);
                        const end = new Date(leave.endDate);

                        const monthStart = new Date(year, month - 1, 1);
                        const monthEnd = new Date(year, month, 0);

                        return start <= monthEnd && end >= monthStart;
                    });
                };

                let availableCL = 0;

                if (!isCLUsedInMonth(prev.month, prev.year)) availableCL += 1;
                if (!isCLUsedInMonth(curr.month, curr.year)) availableCL += 1;
                if (!isCLUsedInMonth(next.month, next.year)) availableCL += 1;

                const empMax = empMaxLeavesData.find(e => e.tId === emp.empCode);

                let remainingCL = 0;

                if (empMax) {
                    remainingCL = Math.max(0, empMax.maxCLs - empMax.usedCLs);
                }
                else remainingCL = 13;

                availableCL = Math.min(availableCL, remainingCL);

                const requiredLeave = emp.halfDays * 0.5;

                const clUsed = Math.min(requiredLeave, availableCL);
                const lwpUsed = Number((requiredLeave - clUsed).toFixed(2));

                emp.reqCasualLeaves = Number(clUsed.toFixed(2));
                emp.reqLeavesWithoutPay = lwpUsed;
            });

            parsedEmployees.forEach((emp) => {
                let totalPayables = 0;
                emp.status.forEach((status, i) => {
                    const isHoliday = publicHolidays.find(h => h.sheetDay === emp.days[i])?.isHoliday;

                    if (status === 'P' || status === 'WO' || isHoliday) {
                        totalPayables += 1;
                    }
                });

                totalPayables += emp.reqCasualLeaves;
                totalPayables -= emp.reqLeavesWithoutPay;
                emp.totalPayableDays = totalPayables;

                const totalDays = punchTimeData.length;
                const basicSalary = basicSalaryData?.find(bs => bs.empId == emp.empCode)?.salary;
                if(!basicSalary){
                    emp.netSalary = 0;
                }
                else{
                    const perDaySalary = basicSalary / totalDays;
                    const netSalary = perDaySalary * totalPayables;
                    emp.netSalary = netSalary;
                }
            })

            setEmployees(parsedEmployees);
            toast.success("Analysis Completed");

        } catch (err) {
            console.error(err);
            toast.error("Error reading file");
        }
    };

    const calTotalLate = (data: EmployeeData) => {
        console.log(JSON.stringify(data));
        let totalMinutes = 0;

        data.lateBy.forEach((lateData: string) => {
            if (lateData && lateData !== "00:00") {
                const [hours, minutes] = lateData.split(":").map(Number);
                totalMinutes += (hours * 60) + minutes;
            }
        });

        // Convert back to HH:MM format
        const finalHours = Math.floor(totalMinutes / 60);
        const finalMinutes = totalMinutes % 60;

        const result = `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
        console.log(result);

        return result;
    };

    const handleResetToDefPunchTime = () => {
        console.log("Punch Time - " + defPunchTime);
        const updated = punchTimeData.map(item => ({
            ...item,
            punchTime: defPunchTime
        }));

        setPunchTimeData(updated);

        toast.success("Reset completed");
    }

    const handleIndividualPunchTime = () => {
        setShowPublicHolidayEdit(false);

        if (punchTimeData.length === 0 || (punchTimeData[0].punchTime === '')) {
            toast.error("Please select the default punch time first");
            return;
        }

        if (showEditIndPunchTime) {
            setShowEditIndPunchTime(false);
            return;
        }
        setShowEditIndPunchTime(true);
    }

    const handleIndividualPublicHoliday = () => {
        setShowEditIndPunchTime(false);
        setShowPublicHolidayEdit(prev => !prev)
    }

    const handleIndividualChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        sheetDay: string
    ) => {
        const { name, value } = e.target;

        const updated = punchTimeData.map(item =>
            item.sheetDay === sheetDay
                ? { ...item, punchTime: value }
                : item
        );

        setPunchTimeData(updated);
    };

    const handleHalfDayCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEmployees([]);
        const { name, value } = e.target;
        setHalfDayCriteria(value);
    }

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
    };

    const resetHolidays = () => {
        setPublicHolidays(prev =>
            prev.map(item => ({ ...item, isHoliday: false }))
        );
        toast.success("Reset completed");
    };

    const handleSessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSession(e.target.value);
        setEmployees([]);
    }

    const handleFieldValuesChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if(name === "sheetMonth"){
            setSheetMonth(value);
        }
        if(name === "sheetYear"){
            setSheetYear(value);
        }
        setEmployees([]);
    }

    const loading = pageLoading || sessionsLoading;

    if (loading) return <FullPageLoader />;

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
                                <InputField type="time" label="Default Punch Time" name="defPunchTime" value={defPunchTime} onChange={handleChange} required />
                            </div>
                            <div className="text-sm mt-2 flex gap-6">
                                <Button type="button" text={showEditIndPunchTime ? 'Hide Individual Punch Time' : 'Edit Individual Punch Time'} icon={<></>} onClick={handleIndividualPunchTime} setGreen={!showEditIndPunchTime} />
                                <Button type="button" text={showPublicHolidayEdit ? 'Hide Public Holidays' : 'Mark Public Holidays'} onClick={handleIndividualPublicHoliday} icon={<></>} setGreen={!showPublicHolidayEdit} />
                            </div>

                            {showEditIndPunchTime && (
                                <div className="flex flex-col gap-5">
                                    <div className="overflow-auto h-64 grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                                        {punchTimeData.map((item, index) => (
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

                            <div className="grid grid-cols-1 mt-5 md:grid-cols-4 gap-4">
                                <SelectField label="Select Half Day Calculation Criteria" name="halfDayCriteria" value={halfDayCriteria} onChange={handleHalfDayCriteriaChange} options={['Days', 'Minutes']} required />
                                <SelectField label="Select Session" name="sessionId" value={selectedSession} onChange={handleSessChange} options={sessions} required />
                                <SelectField label="Enter Sheet Month Number" name="sheetMonth" value={sheetMonth} onChange={handleFieldValuesChange} options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]} required/>
                                <InputField label="Enter Sheet Year (xxxx)" name="sheetYear" value={sheetYear} onChange={handleFieldValuesChange} required />
                            </div>

                            <FormFooterActions primaryLabel="Execute" />
                        </FormSection>
                    </form>
                </div>
            )}

            {punchTimeInput && employees.length > 0 && (
                <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
                    <FormSection title="Employees" icon={<Sheet />}>
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
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-auto mr-3">
                                                <span className="relative text-white rounded-full px-3 py-1 text-sm font-semibold bg-linear-to-br from-amber-400 via-amber-500 to-amber-700 shadow-md">
                                                    Total Late: {emp.totalLate}
                                                </span>

                                                <span className="text-sm text-white px-3 py-1 rounded-full font-semibold bg-linear-to-br from-purple-400 via-purple-500 to-purple-700 shadow-md">
                                                    Half Days: {emp.halfDays}
                                                </span>

                                                <button
                                                    onClick={() => setSalaryModalEmp(emp)}
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
                                                        <td className="border px-2 py-1 font-bold h-10">Status</td>
                                                        {emp.status.map((val, i) => (
                                                            <td key={i} className={`border px-2 ${emp.halfDayFlags[i] ? 'bg-purple-500 text-white border-black' : ''}`}>{val}</td>
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

                    </FormSection>

                    {salaryModalEmp && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

                            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">

                                {/* Close Button */}
                                <button
                                    onClick={() => setSalaryModalEmp(null)}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl cursor-pointer"
                                >
                                    ✕
                                </button>

                                {/* Header */}
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                                    Salary Breakdown
                                </h2>

                                {/* Employee Info */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600">Employee</p>
                                    <p className="font-semibold text-lg">
                                        {salaryModalEmp.name} ({salaryModalEmp.empCode})
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 text-sm">

                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <p className="text-gray-500">Present Days</p>
                                        <p className="font-bold">{salaryModalEmp.totalPresentDays}</p>
                                    </div>

                                    <div className="p-3 bg-gray-100 rounded-lg">
                                        <p className="text-gray-500">Public Holidays</p>
                                        <p className="font-bold">{salaryModalEmp.publicHolidays}</p>
                                    </div>

                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <p className="text-gray-500">CL Required</p>
                                        <p className="font-bold text-purple-700">
                                            {salaryModalEmp.reqCasualLeaves}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <p className="text-gray-500">LWP Required</p>
                                        <p className="font-bold text-red-600">
                                            {salaryModalEmp.reqLeavesWithoutPay}
                                        </p>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="mt-5 p-3 bg-amber-50 rounded-lg text-center">
                                    <p className="text-gray-500 text-sm">Total Payable Days</p>
                                    <p className="text-2xl font-bold text-amber-700">
                                        {salaryModalEmp.totalPayableDays}
                                    </p>
                                </div>

                                <div className="mt-5 p-3 bg-green-50 rounded-lg text-center">
                                    <p className="text-gray-500 text-sm">Net Salary</p>
                                    <p className="text-2xl font-bold text-green-700">
                                        {salaryModalEmp.netSalary}
                                    </p>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}