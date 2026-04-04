'use client';

import Button from "@/components/ui/Button";
import FileUpload from "@/components/ui/FileUpload";
import FormFooterActions from "@/components/ui/FormFooterActions";
import FormSection from "@/components/ui/FormSection";
import FullPageLoader from "@/components/ui/FullPageLoader";
import Header from "@/components/ui/Header";
import UserInfo from "@/components/ui/UserInfo";
import { useUser } from "@/context/UserContext";
import { Camera, FileSpreadsheet, Settings2, Sheet, StepBack } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import InputField from "@/components/ui/InputField";

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
};

type PunchTimeData = {
    sheetDay: string;
    punchTime: string;
}

type ExcelRow = (string | number | boolean | null | undefined)[];

export default function Salary() {
    const router = useRouter();
    const [pageLoading, setPageLoading] = useState(false);
    const [tapInOutSheet, setTapInOutSheet] = useState<TapInOut>({
        tapInOutExcel: null
    });

    const [employees, setEmployees] = useState<EmployeeData[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const { user } = useUser();

    const [punchTimeInput, setPunchTimeInput] = useState(false);
    const [sheetDays, setSheetDays] = useState<string[]>([]);
    const [defPunchTime, setDefPunchTime] = useState<string>('');
    const [punchTimeData, setPunchTimeData] = useState<PunchTimeData[]>([]);

    const [showEditIndPunchTime, setShowEditIndPunchTime] = useState(false);

    const goBack = () => {
        setPageLoading(true);
        router.back();
    };

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
        }
        catch (err) {
            console.error(err);
            toast.error("Error reading file");
        }


        setPunchTimeInput(true);
    }

    const handlePreview = async (e: React.FormEvent) => {
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
                        status: getRowValues(statusRow).slice(1),
                        inTime: getRowValues(inRow).slice(1),
                        outTime: getRowValues(outRow).slice(1),
                        total: getRowValues(totalRow).slice(1),
                        lateBy: []
                    });

                    i += 4;
                }
            }

            if (parsedEmployees.length === 0) {
                toast.error("No employees found");
                return;
            }

            parsedEmployees.forEach((emp) => {
                emp.lateBy = emp.status.map((status, i) => {
                    if (status == 'P') {
                        const inTime = emp.inTime[i];
                        const punch = emp.punchTime[i];

                        if (inTime && punch) {
                            const diff = timeToMinutes(inTime) - timeToMinutes(punch);
                            return diff > 0 ? minutesToTime(diff) : '00:00';
                        }
                    }
                    return '00:00';
                });
            });

            setEmployees(parsedEmployees);
            toast.success("Analysis Completed");

        } catch (err) {
            console.error(err);
            toast.error("Error reading file");
        }
    };

    const handleResetToDefPunchTime = () => {
        console.log("Punch Time - " + defPunchTime);
        const updated = punchTimeData.map(item => ({
            ...item,
            punchTime: defPunchTime
        }));

        setPunchTimeData(updated);
    }

    const handleIndividualPunchTime = () => {
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

    if (pageLoading) return <FullPageLoader />;

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-100 to-blue-200 p-6">
            <Button onClick={goBack} icon={<StepBack size={18} />} text='Go Back' />

            <UserInfo name={user?.name || ''} role={user?.desc || ''} />

            <Header title='Sapient Heights' info='Manage salary for Sapient Heights' />

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
                        <FormSection title="Punch Time Settings" icon={<Settings2 />} margin={false}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField type="time" label="Default Punch Time" name="defPunchTime" value={defPunchTime} onChange={handleChange} />
                            </div>
                            <div className="text-sm mt-2">
                                <Button type="button" text={showEditIndPunchTime ? 'Hide Individual Punch Time' : 'Edit Individual Punch Time'} icon={<></>} onClick={handleIndividualPunchTime} setGreen={!showEditIndPunchTime} />
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
                                        className="p-3 bg-gray-100 cursor-pointer flex justify-between"
                                        onClick={() =>
                                            setExpandedIndex(expandedIndex === index ? null : index)
                                        }
                                    >
                                        <span>
                                            {emp.name} (Emp Code: {emp.empCode})
                                        </span>
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
                                                            <td key={i} className="border px-2">{val}</td>
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
                </div>
            )}
        </div>
    );
}