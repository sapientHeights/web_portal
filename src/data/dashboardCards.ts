import { UserPlus, School, Receipt, FileBarChart, CalendarCheck, Settings, Newspaper } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type DashboardCard = {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  module: string;
};


export const dashboardCards: DashboardCard[] = [
    {
        id: 1,
        title: 'Register Teacher',
        description: 'Add new teachers, manage profiles, and assign subjects to faculty members',
        icon: UserPlus,
        module: 'register-teacher',
    },
    {
        id: 2,
        title: 'Register Student',
        description: 'Enroll new students, manage admissions, and maintain student records',
        icon: School,
        module: 'register-student',
    },
    {
        id: 3,
        title: 'Fee Management',
        description: 'Track fee payments, generate receipts, and manage financial transactions',
        icon: Receipt,
        module: 'fee-management',
    },
    {
        id: 4,
        title: 'Reports',
        description: 'Generate comprehensive reports on academics, attendance, and finances',
        icon: FileBarChart,
        module: 'reports',
    },
    {
        id: 5,
        title: 'Attendance Management',
        description: 'Track student and teacher attendance with detailed analytics and reports',
        icon: CalendarCheck,
        module: 'attendance',
    },
    {
        id: 6,
        title: 'School Settings',
        description: 'Configure school information, academic year, and system preferences',
        icon: Settings,
        module: 'settings',
    },
    {
        id: 7,
        title: 'Notices',
        description: 'Add notices for the students',
        icon: Newspaper,
        module: 'notice'
    }
];