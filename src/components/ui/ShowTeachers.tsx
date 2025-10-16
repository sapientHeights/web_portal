import { TeacherAllData } from "@/types/teacher"
import { UserRoundCog, ArrowRight, Sheet } from "lucide-react";
import FormSection from "./FormSection";
import NoDataSection from "./NoDataSection";
import { SetStateAction, useEffect, useState } from "react";
import AllotTeacher from "./AllotTeacher";
import InputField from "./InputField";
import ShowTeacherClasses from "./ShowTeacherClasses";

type Props = {
    teachersData : TeacherAllData[] | null;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
}

export default function ShowTeachers({teachersData, setLoading} : Props){
    const [showDialog, setShowDialog] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherAllData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [filteredTeachers, setFilteredTeachers] = useState<TeacherAllData[] | null>(teachersData);
    const [showTable, setShowTable] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        setSearchTerm(value);
    }

    useEffect(() => {
        if(searchTerm === ''){
            setFilteredTeachers(teachersData);
        }
        else{
            const searchedData = teachersData ? teachersData.filter((data) => data.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) : null;
            setFilteredTeachers(searchedData);
        }
    }, [searchTerm])

    const openDialog = (teacher: TeacherAllData) => {
        setShowDialog(true);
        setSelectedTeacher(teacher);
    }

    const openTable = (teacher: TeacherAllData) => {
        setShowTable(true);
        setSelectedTeacher(teacher);
    }

    return(
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-4xl shadow-xl p-6 md:p-10 mb-10">
            {teachersData && teachersData.length === 0 ? (
                <NoDataSection />
            ) : (
                <FormSection title="All Teachers" icon={<UserRoundCog />} margin={false} >
                    <InputField label="Search by Name" name="search" value={searchTerm} onChange={handleSearchChange}/>
                    <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white mt-6">
                        <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
                                <tr>
                                    <th className="px-6 py-4">S.No.</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Designation</th>
                                    <th className="px-6 py-4">Qualification</th>
                                    <th className="px-6 py-4">Experience</th>
                                    <th className="px-1 py-4"></th>
                                    <th className="px-1 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-center">
                                {filteredTeachers && filteredTeachers.map((data, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">{index + 1}</td>
                                        <td className="px-6 py-4">{data.teacherName}</td>
                                        <td className="px-6 py-4">{data.designation}</td>
                                        <td className="px-6 py-4">{data.qualification}</td>
                                        <td className="px-6 py-4">{data.experience}</td>
                                        <td className="px-1 py-4 text-blue-500 cursor-pointer" onClick={() => openTable(data)}>{<Sheet size={12} />}</td>
                                        <td className="px-1 py-4 text-green-500 cursor-pointer" onClick={() => openDialog(data)}>{<ArrowRight size={12} />}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </FormSection >
            )}

            {showDialog && (
                <AllotTeacher setShowDialog={setShowDialog} selectedTeacher={selectedTeacher} setLoading={setLoading} />
            )}

            {showTable && selectedTeacher && (
                <ShowTeacherClasses setShowTable = {setShowTable} selectedTeacher = {selectedTeacher} />
            )}
        </div >
    )
}