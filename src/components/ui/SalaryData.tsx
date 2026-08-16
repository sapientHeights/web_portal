import { useEffect, useState } from "react";
import FormSection from "./FormSection";
import { SquareMousePointer, Table } from "lucide-react";
import SelectField from "./SelectField";
import FormFooterActions from "./FormFooterActions";
import toast from "react-hot-toast";
import InputField from "./InputField";
import NoDataSection from "./NoDataSection";
import Button from "./Button";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// Mirrors the `salary_data` table columns exactly (camelCase, matching
// what saveAllEmpSalaryData.php inserts).
type SalaryDataRecord = {
    name: string;
    empCode: string;
    month: number;
    year: number;
    sessionId: string;

    totalPresentDays: number;
    totalAbsentDays: number;
    weeklyOffs: number;
    publicHolidays: number;
    approvedCLDays: number;
    totalLateCount: number;
    actualHalfDay: number;
    lateConvertedLWP: number;
    totalHalfDay: number;
    paidDays: number;
    workingDays: number;

    monthlySalary: number;
    perDaySalary: number;
    halfDayDeduction: number;
    absentDeduction: number;
    lwpDeduction: number;
    totalDeduction: number;
    netSalary: number;
}

type Props = {
    sessions: string[];
    activeSession: string | undefined;
}

export default function SalaryData({ sessions, activeSession }: Props) {
    const [salaryData, setSalaryData] = useState<SalaryDataRecord[]>([])
    const [sessionId, setSessionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [sheetMonth, setSheetMonth] = useState('');
    const [sheetYear, setSheetYear] = useState('');

    // Tracks whether a search has actually been run yet, so we don't show
    // "No data found" before the user has even clicked Get Data.
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (activeSession) {
            setSessionId(activeSession);
        }
    }, [activeSession])

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const handleFieldValuesChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "sheetMonth") {
            setSheetMonth(value);
        }
        if (name === "sheetYear") {
            setSheetYear(value);
        }
        setSalaryData([]);
        setHasSearched(false);
    }

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSessionId(e.target.value);
        setSalaryData([]);
        setHasSearched(false);
    }

    const getSavedSalaryData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/getSavedSalaryData.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    sheetMonth: sheetMonth,
                    sheetYear: sheetYear
                })
            })
            const data = await res.json();
            if (data.error) {
                toast.error("Some error occurred");
            }
            else {
                setSalaryData(data.noData ? [] : data.data);
            }
        }
        catch (err) {
            toast.error("Some error occurred");
        }
        finally {
            setLoading(false);
            setHasSearched(true);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!sessionId || !sheetMonth || !sheetYear) {
            toast.error("Please fill all the required fields");
            return;
        }
        getSavedSalaryData();
    }

    // Same export flow as SheetAnalysis's handleExportToExcel, adapted to
    // read from the already-fetched saved records instead of a freshly
    // computed `employees` array.
    const handleExportToExcel = async () => {
        if (salaryData.length === 0) {
            toast.error("No data to export");
            return;
        }

        const dataToExport = salaryData.map((emp) => ({
            name: emp.name,
            empCode: emp.empCode,
            totalDaysInMonth: String(emp.workingDays),
            present: String(emp.totalPresentDays),
            totalLate: String(emp.totalLateCount),
            totalHD: String(emp.totalHalfDay),
            absent: String(emp.totalAbsentDays),
            totalWO: String(emp.weeklyOffs),
            totalPH: String(emp.publicHolidays),
            approvedCL: String(emp.approvedCLDays),
            payableDays: String(emp.paidDays),
            basicSalary: String(emp.monthlySalary),
            halfDayDeduction: String(Number(emp.halfDayDeduction).toFixed(2)),
            absentDeduction: String(Number(emp.absentDeduction).toFixed(2)),
            lwpDeduction: String(Number(emp.lwpDeduction).toFixed(2)),
            totalDeduction: String(emp.totalDeduction),
            netSalary: String(emp.netSalary),
        }));

        setIsExporting(true);
        try {
            const res = await fetch("/api/exportSalaryData", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: dataToExport }),
            });

            if (!res.ok) {
                toast.error("Failed to download Excel");
                return;
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            const monthName = MONTH_NAMES[Number(sheetMonth) - 1] ?? sheetMonth;

            let finalName = `Salary Data`;
            if (sessionId !== '') finalName += `_${sessionId}`;
            if (sheetMonth !== '') finalName += `_${monthName}`;
            if (sheetYear !== '') finalName += `_${sheetYear}`;

            a.download = (finalName + '.xlsx');
            a.click();
            URL.revokeObjectURL(url);
        }
        catch (err) {
            console.error(err);
            toast.error("An error occurred while exporting Excel");
        }
        finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10">
                <form onSubmit={handleSubmit}>
                    <FormSection title="Select" icon={<SquareMousePointer />} margin={false}>
                        <div className="grid grid-cols-1 mt-5 md:grid-cols-3 gap-4">
                            <SelectField label="Select session" name="sessionId" value={sessionId} onChange={handleSessionChange} options={sessions} />
                            <SelectField label="Enter Sheet Month Number" name="sheetMonth" value={sheetMonth} onChange={handleFieldValuesChange} options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]} required />
                            <InputField label="Enter Sheet Year (xxxx)" name="sheetYear" value={sheetYear} onChange={handleFieldValuesChange} required />
                        </div>
                        <FormFooterActions primaryLabel="Get Data" />
                    </FormSection>
                </form>
            </div>

            {(loading || hasSearched) && (
                <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 mb-10">
                    <FormSection title="Salary Data" icon={<Table />} margin={false}>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-10">
                                <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <p className="text-gray-500 text-sm animate-pulse">
                                    Loading salary data...
                                </p>
                            </div>
                        ) : salaryData && salaryData.length > 0 ? (
                            <>
                                <div className="w-full max-h-[500px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white mt-4">
                                    <table className="min-w-[2000px] w-full text-sm text-left text-gray-700">
                                    <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                        <tr>
                                            <th className="px-4 py-4">S.No.</th>
                                            <th className="px-4 py-4">Name</th>
                                            <th className="px-4 py-4">Emp Code</th>
                                            <th className="px-4 py-4">Total Days in Month</th>
                                            <th className="px-4 py-4">Present</th>
                                            <th className="px-4 py-4">Total Late</th>
                                            <th className="px-4 py-4">Actual HD</th>
                                            <th className="px-4 py-4">Late Conv. LWP</th>
                                            <th className="px-4 py-4">Total HD</th>
                                            <th className="px-4 py-4">Absent</th>
                                            <th className="px-4 py-4">Total W/O</th>
                                            <th className="px-4 py-4">Total PH</th>
                                            <th className="px-4 py-4">Approved CL</th>
                                            <th className="px-4 py-4">Net Pay Days</th>
                                            <th className="px-4 py-4">Basic Salary</th>
                                            <th className="px-4 py-4">Half Day Deduction</th>
                                            <th className="px-4 py-4">Absent Deduction</th>
                                            <th className="px-4 py-4">LWP Deduction</th>
                                            <th className="px-4 py-4">Total Deduction</th>
                                            <th className="px-4 py-4">Net Salary of Month</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 text-center">
                                        {salaryData.map((data, index) => (
                                            <tr key={`${data.empCode}-${index}`} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4">{index + 1}</td>
                                                <td className="px-4 py-4 text-left">{data.name}</td>
                                                <td className="px-4 py-4">{data.empCode}</td>
                                                <td className="px-4 py-4">{data.workingDays}</td>
                                                <td className="px-4 py-4">{data.totalPresentDays}</td>
                                                <td className="px-4 py-4">{data.totalLateCount}</td>
                                                <td className="px-4 py-4">{data.actualHalfDay}</td>
                                                <td className="px-4 py-4">{Number(data.lateConvertedLWP).toFixed(2)}</td>
                                                <td className="px-4 py-4">{data.totalHalfDay}</td>
                                                <td className="px-4 py-4">{data.totalAbsentDays}</td>
                                                <td className="px-4 py-4">{data.weeklyOffs}</td>
                                                <td className="px-4 py-4">{data.publicHolidays}</td>
                                                <td className="px-4 py-4">{data.approvedCLDays}</td>
                                                <td className="px-4 py-4">{data.paidDays}</td>
                                                <td className="px-4 py-4">{data.monthlySalary}</td>
                                                <td className="px-4 py-4">{Number(data.halfDayDeduction).toFixed(2)}</td>
                                                <td className="px-4 py-4">{Number(data.absentDeduction).toFixed(2)}</td>
                                                <td className="px-4 py-4">{Number(data.lwpDeduction).toFixed(2)}</td>
                                                <td className="px-4 py-4">{data.totalDeduction}</td>
                                                <td className="px-4 py-4 font-semibold">{data.netSalary}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                                <div className="flex justify-start mt-4">
                                    <Button
                                        type="button"
                                        text={isExporting ? "Exporting..." : "Export to Excel"}
                                        icon={<></>}
                                        onClick={handleExportToExcel}
                                    />
                                </div>
                            </>
                        ) : (
                            <NoDataSection />
                        )}
                    </FormSection>
                </div>
            )}
        </>
    )
}