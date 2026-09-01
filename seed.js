import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2GaHn9rNmcWMhjKBU4SMLnpb_XDf6YYY",
  authDomain: "fcahpt-vom-portal.firebaseapp.com",
  projectId: "fcahpt-vom-portal",
  storageBucket: "fcahpt-vom-portal.firebasestorage.app",
  messagingSenderId: "477937811494",
  appId: "1:477937811494:web:62c8729b23578c2d9ae6e7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedData = async () => {
  try {
    console.log('Clearing old data...');
    // Delete all existing courses
    const coursesSnap = await getDocs(collection(db, 'courses'));
    const deleteBatch = writeBatch(db);
    coursesSnap.forEach(d => deleteBatch.delete(d.ref));
    
    // Delete all existing curricula
    const curriculaSnap = await getDocs(collection(db, 'curricula'));
    curriculaSnap.forEach(d => deleteBatch.delete(d.ref));
    
    await deleteBatch.commit();
    console.log('Old data cleared.');

    const batch = writeBatch(db);

    // ── Courses ────────────────────────────────────────────────────────────
    const courses = [
      // ND 1 Semester 1
      { courseCode: 'MTH101', title: 'Mathematics I',              creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
      { courseCode: 'COS101', title: 'Introduction to Computing',  creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
      { courseCode: 'COS102', title: 'Computer Hardware',          creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
      { courseCode: 'COS103', title: 'Office Productivity Tools',  creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
      { courseCode: 'COM101', title: 'Communication Skills I',     creditUnits: 2, department: 'General',          level: 'ND 1', semester: 1, prerequisites: [] },

      // ND 1 Semester 2
      { courseCode: 'MTH102', title: 'Mathematics II',             creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['MTH101'] },
      { courseCode: 'COS104', title: 'Introduction to Programming',creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['COS101'] },
      { courseCode: 'COS105', title: 'Operating Systems I',        creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['COS102'] },
      { courseCode: 'COS106', title: 'Data and Information',       creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['COS101'] },
      { courseCode: 'COM102', title: 'Communication Skills II',    creditUnits: 2, department: 'General',          level: 'ND 1', semester: 2, prerequisites: ['COM101'] },

      // ND 2 Semester 1
      { courseCode: 'COS201', title: 'Data Structures & Algorithms', creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS104'] },
      { courseCode: 'COS202', title: 'Database Management Systems',  creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS106'] },
      { courseCode: 'COS203', title: 'Web Technology I',             creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS104'] },
      { courseCode: 'COS204', title: 'Object-Oriented Programming',  creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS104'] },
      { courseCode: 'COS205', title: 'Computer Networks I',          creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COS105'] },

      // ND 2 Semester 2
      { courseCode: 'COS206', title: 'Software Engineering',         creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: ['COS201', 'COS204'] },
      { courseCode: 'COS207', title: 'Web Technology II',            creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: ['COS203'] },
      { courseCode: 'COS208', title: 'Computer Networks II',         creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: ['COS205'] },
      { courseCode: 'COS209', title: 'Project Management',           creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: [] },
      { courseCode: 'COS210', title: 'Industrial Training Report',   creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: [] },
    ];

    courses.forEach(course => {
      const ref = doc(collection(db, 'courses'), course.courseCode);
      batch.set(ref, course);
    });

    // ── Curriculum ─────────────────────────────────────────────────────────
    const curriculum = {
      program: 'ND Computer Science',
      courses: courses.map(c => ({
        level: c.level,
        semester: c.semester,
        courseCode: c.courseCode,
      })),
    };

    batch.set(doc(collection(db, 'curricula'), 'nd_computer_science'), curriculum);
    
    // Fallback HND curriculum (just reusing ND courses for placeholder so it doesn't break for HND students)
    const hndCurriculum = {
      program: 'HND Computer Science',
      courses: courses.map(c => ({
        level: c.level === 'ND 1' ? 'HND 1' : 'HND 2',
        semester: c.semester,
        courseCode: c.courseCode,
      })),
    };
    batch.set(doc(collection(db, 'curricula'), 'hnd_computer_science'), hndCurriculum);

    await batch.commit();
    console.log('✅  Database seeded successfully with Computer Science curriculum!');
  } catch (error) {
    console.error('❌  Error seeding database:', error);
  }
};

seedData();
