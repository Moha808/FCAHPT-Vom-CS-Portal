import { create } from 'zustand';
import { Course, Curriculum, Enrollment } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';

interface DataState {
  enrollments: Enrollment[];
  courses: Course[];
  curriculum: Curriculum | null;
  loading: boolean;
  fetchStudentData: (studentId: string, program: string, level?: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  enrollments: [],
  courses: [],
  curriculum: null,
  loading: false,

  fetchStudentData: async (studentId: string, program: string, level: string = 'ND 1') => {
    set({ loading: true });
    try {
      // 1. Fetch all courses first
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const courses = coursesSnap.docs.map(doc => ({ ...doc.data() } as Course));

      // 2. Fetch enrollments
      const enrollmentsQ = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
      let enrollmentsSnap = await getDocs(enrollmentsQ);
      let rawEnrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));

      // Sanitize raw enrollments: remove any legacy mock grades ('B' or mock 'passed') unless updated by advisor
      let enrollments = rawEnrollments.map(e => {
        if (!e.gradedBy && (e.grade === 'B' || e.grade === 'A')) {
          return { ...e, grade: null, status: 'in_progress' as const };
        }
        return e;
      });

      // 3. Fallback: If no enrollments exist for this student, auto-populate initial enrollments with status 'in_progress'
      if (enrollments.length === 0 && courses.length > 0) {
        const targetLevel = level.startsWith('HND') ? level.replace('HND', 'ND') : level;
        const batch = writeBatch(db);
        const autoEnrollments: Enrollment[] = [];

        courses.forEach(course => {
          if (course.level === targetLevel || (targetLevel === 'ND 2' && course.level === 'ND 1')) {
            const enrollmentRef = doc(collection(db, 'enrollments'));
            const record: any = {
              studentId: studentId,
              courseCode: course.courseCode,
              semester: course.semester,
              grade: null,
              status: 'in_progress',
              enrolledAt: new Date().toISOString(),
            };
            batch.set(enrollmentRef, record);
            autoEnrollments.push({ id: enrollmentRef.id, ...record });
          }
        });

        if (autoEnrollments.length > 0) {
          try {
            await batch.commit();
          } catch (e) {
            // Silence permission error on client if rules restrict student batch write
          }
          enrollments = autoEnrollments;
        }
      }

      // 4. Fetch curriculum
      const curQ = query(collection(db, 'curricula'), where('program', '==', program));
      const curSnap = await getDocs(curQ);
      let curriculum = null;
      if (!curSnap.empty) {
        curriculum = { id: curSnap.docs[0].id, ...curSnap.docs[0].data() } as Curriculum;
      }

      set({ enrollments, curriculum, courses, loading: false });
    } catch (error) {
      console.error("Error fetching student data:", error);
      set({ loading: false });
    }
  }
}));
