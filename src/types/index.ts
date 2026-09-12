export type Role = 'student' | 'advisor' | 'admin';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: Role;
  matricNumber?: string;
  phone?: string;
  department?: string;
  program?: string;
  level?: string;
  advisorId?: string;
  advisorName?: string;
  advisorEmail?: string;
  advisorPhone?: string;
  isActive?: boolean;
  cgpa?: string;
  cgpaCategory?: string;
}

export interface Complaint {
  id?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentMatric?: string;
  category: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  response?: string;
  createdAt: string;
}

export interface Course {
  courseCode: string;
  title: string;
  creditUnits: number;
  department: string;
  level: string;
  semester: number;
  prerequisites: string[];
}

export interface Enrollment {
  id?: string;
  studentId: string;
  courseCode: string;
  semester: number;
  session?: string;
  grade?: string | null;
  status: 'passed' | 'failed' | 'pending' | 'in_progress';
  gradedBy?: string;
  gradedAt?: string;
  enrolledAt?: string;
}

export interface Curriculum {
  id?: string;
  program: string;
  courses: {
    level: string;
    semester: number;
    courseCode: string;
  }[];
}
