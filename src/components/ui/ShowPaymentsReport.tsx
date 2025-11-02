'use client';

import { StudentPaymentReport } from "@/types/fee";

type Props = {
  feePaymentsData: StudentPaymentReport[];
  subCategory: string;
}

export default function ShowPaymentsReport({feePaymentsData, subCategory} : Props) {
  const showDailyPayment = subCategory === 'daily';
  const showMonthlyPayment = subCategory === 'monthly';

  return (    
    <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
      <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-left">
          <tr>
            <th className="px-6 py-4">S.No.</th>
            {showDailyPayment && (
              <th className="px-6 py-4">Session Id</th>
            )}
            <th className="px-6 py-4">Student Name</th>
            <th className="px-6 py-4">Class</th>
            <th className="px-6 py-4">Section</th>
            {showMonthlyPayment && (
                <th className="px-6 py-4">Date</th>
            )}
            <th className="px-6 py-4">Mode</th>
            <th className="px-6 py-4">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-left">
          {feePaymentsData.length === 0 && (
            <tr className="hover:bg-gray-50 transition-colors">
              <td colSpan={showMonthlyPayment ? 8 : 7} className="px-6 py-8 font-semibold text-center">No Data Available</td>
            </tr>
          )}
          {feePaymentsData.length > 0 && feePaymentsData.map((student, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium">{index+1}</td>
              {showDailyPayment && (
                <td className="px-6 py-4 font-medium">{student.sessionId}</td>
              )}
              <td className="px-6 py-4 font-medium">{student.studentName}</td>
              <td className="px-6 py-4 font-medium">{student.classId}</td>
              <td className="px-6 py-4 font-medium">{student.section}</td>
              {showMonthlyPayment && (
                <td className="px-6 py-4 font-medium">{student.paymentDate}</td>
              )}
              <td className="px-6 py-4 font-medium">{student.paymentMode}</td>
              <td className="px-6 py-4 font-medium">{student.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};