'use client';

import { FeeData } from "@/types/fee";
import { ListPlus, Sheet, SquarePen } from "lucide-react";
import { useState } from "react";
import ShowPayments from "./ShowPayments";

type Props = {
  feeData: FeeData[];
  category: string;
  setUpdateFee: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedStd: React.Dispatch<React.SetStateAction<FeeData | null>>;
  getFeeData : () => void;
}

export default function Table({feeData, category, setUpdateFee, setSelectedStd, getFeeData} : Props) {
  const [showPayments, setShowPayments] = useState(false);
  const [selectedStdFee, setSelectedStdFee] = useState<FeeData | null>(null);

  const showPaidFee = category === 'feePaid';
  const showFeeMaster = category === 'feeMaster';

  const edit = (stdFee: FeeData) => {
    setUpdateFee(true);
    setSelectedStd(stdFee);
  }

  const payments = (stdFee: FeeData) => {
    setSelectedStdFee(stdFee);
    setShowPayments(true);
  }

  return (
    <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
      <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-left">
          <tr>
            <th className="px-6 py-4">Student Name</th>
            {showFeeMaster && (
              <>
              <th className="px-6 py-4">Total Fee</th>
              <th className="px-6 py-4">Discount</th>
              </>
            )}
            <th className="px-6 py-4">Final Fee</th>
            {showPaidFee && (
              <>
              <th className="px-6 py-4">Fee Paid</th>
              <th className="px-6 py-4">Remaining Fee</th>
              </>
            )}
            <th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-left">
          {feeData.map((student, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium">{student.studentName}</td>
              {showFeeMaster && (
                <>
                <td className="px-6 py-4">₹{student.fee.toLocaleString()}</td>
                <td className="px-6 py-4 text-red-600">- ₹{student.discount.toLocaleString()}</td>
                </>
              )}
              <td className="px-6 py-4 font-semibold text-green-700">₹{(student.fee - student.discount).toLocaleString()}</td>
              {showPaidFee && (
                <>
                <td className="px-6 py-4">₹{student.paid.toLocaleString()}</td>
                <td className="px-6 py-4">₹{((student.fee - student.discount) - student.paid).toLocaleString()}</td>
                </>
              )}
              <td>{showFeeMaster ? 
                <SquarePen size={16} className="cursor-pointer hover:text-blue-800" onClick={() => edit(student)}/> 
              : 
                <div className="flex items-center justify-between">
                  <Sheet size={16} className="cursor-pointer hover:text-green-800" onClick={() => payments(student)}/>
                  <ListPlus size={16} className="cursor-pointer hover:text-blue-800" onClick={() => edit(student)}/>
                </div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPayments && (
        <ShowPayments selectedStd={selectedStdFee} setShowPayments={setShowPayments} getFeeData={getFeeData} />
      )}
    </div>
  );
};