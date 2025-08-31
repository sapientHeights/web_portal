'use client';

interface StudentFee {
  name: string;
  totalFees: number;
  discount: number;
  finalFees: number;
}

const studentData: StudentFee[] = [
  { name: 'Aarav Sharma', totalFees: 100000, discount: 10000, finalFees: 90000 },
  { name: 'Diya Mehta', totalFees: 100000, discount: 5000, finalFees: 95000 },
  { name: 'Kabir Gupta', totalFees: 100000, discount: 2000, finalFees: 98000 },
  { name: 'Saanvi Verma', totalFees: 100000, discount: 8000, finalFees: 92000 },
  { name: 'Ishaan Singh', totalFees: 100000, discount: 15000, finalFees: 85000 },
  { name: 'Anaya Joshi', totalFees: 100000, discount: 5000, finalFees: 95000 },
  { name: 'Vivaan Patel', totalFees: 100000, discount: 7000, finalFees: 93000 },
  { name: 'Meera Rao', totalFees: 100000, discount: 2000, finalFees: 98000 },
  { name: 'Reyansh Nair', totalFees: 100000, discount: 10000, finalFees: 90000 },
  { name: 'Aadhya Kulkarni', totalFees: 100000, discount: 4000, finalFees: 96000 },
  { name: 'Arjun Reddy', totalFees: 100000, discount: 8000, finalFees: 92000 },
  { name: 'Tara Desai', totalFees: 100000, discount: 1000, finalFees: 99000 },
];

export default function Table() {
  return (
    <div className="w-full max-h-[400px] overflow-y-auto overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white">
      <table className="min-w-[600px] w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 sticky top-0 z-10 text-xs uppercase text-gray-600 tracking-wider text-center">
          <tr>
            <th className="px-6 py-4">Student Name</th>
            <th className="px-6 py-4">Total Yearly Fees</th>
            <th className="px-6 py-4">Discount</th>
            <th className="px-6 py-4">Final Yearly Fees</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-center">
          {studentData.map((student, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium">{student.name}</td>
              <td className="px-6 py-4">₹{student.totalFees.toLocaleString()}</td>
              <td className="px-6 py-4 text-red-600">- ₹{student.discount.toLocaleString()}</td>
              <td className="px-6 py-4 font-semibold text-green-700">₹{student.finalFees.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};