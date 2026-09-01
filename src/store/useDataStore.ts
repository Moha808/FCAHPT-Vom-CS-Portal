import { create } from 'zustand';
import { Course, Curriculum, Enrollment } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface DataState {
  enrollments: Enrollment[];
  courses: Course[];
  curriculum: Curriculum | null;
  loading: boolean;
  fetchStudentData: (studentId: string, program: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  enrollments: [],
  courses: [],
  curriculum: null,
  loading: false,

  fetchStudentData: async (studentId: string, program: string) => {
    set({ loading: true });
    try {
      // 1. Fetch enrollments
      const enrollmentsQ = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
      const enrollmentsSnap = await getDocs(enrollmentsQ);
      const enrollments = enrollmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment));

      // 2. Fetch curriculum
      const curQ = query(collection(db, 'curricula'), where('program', '==', program));
      const curSnap = await getDocs(curQ);
      let curriculum = null;
      if (!curSnap.empty) {
        curriculum = { id: curSnap.docs[0].id, ...curSnap.docs[0].data() } as Curriculum;
      }

      // 3. Fetch all courses (for recommendations and lookups)
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const courses = coursesSnap.docs.map(doc => ({ ...doc.data() } as Course));

      set({ enrollments, curriculum, courses, loading: false });
    } catch (error) {
      console.error("Error fetching student data:", error);
      set({ loading: false });
    }
  }
}));
