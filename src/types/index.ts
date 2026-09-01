export type Role = 'student' | 'advisor' | 'admin';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  program?: string;
  level?: string;
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
  session: string;
  grade: string | null;
  status: 'passed' | 'failed' | 'pending';
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
