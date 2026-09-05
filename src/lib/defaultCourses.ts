import { Course } from '../types';

export const ND_COURSES: Course[] = [
  { courseCode: 'COM111', title: 'Introduction to Computing', creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
  { courseCode: 'MTH111', title: 'Mathematics I', creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
  { courseCode: 'COM112', title: 'Computer Hardware Principles', creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
  { courseCode: 'COM113', title: 'Office Productivity Packages', creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 1, prerequisites: [] },
  { courseCode: 'GNS101', title: 'Communication Skills I', creditUnits: 2, department: 'General Studies', level: 'ND 1', semester: 1, prerequisites: [] },

  { courseCode: 'COM121', title: 'Introduction to Programming (Python)', creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['COM111'] },
  { courseCode: 'MTH112', title: 'Mathematics II', creditUnits: 3, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['MTH111'] },
  { courseCode: 'COM122', title: 'Operating Systems I', creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['COM112'] },
  { courseCode: 'COM123', title: 'Data & Information Processing', creditUnits: 2, department: 'Computer Science', level: 'ND 1', semester: 2, prerequisites: ['COM111'] },
  { courseCode: 'GNS102', title: 'Communication Skills II', creditUnits: 2, department: 'General Studies', level: 'ND 1', semester: 2, prerequisites: ['GNS101'] },

  { courseCode: 'COM211', title: 'Data Structures & Algorithms', creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COM121'] },
  { courseCode: 'COM212', title: 'Database Management Systems', creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COM123'] },
  { courseCode: 'COM213', title: 'Web Technology I (HTML/CSS/JS)', creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COM121'] },
  { courseCode: 'COM214', title: 'Object-Oriented Programming (Java)', creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COM121'] },
  { courseCode: 'COM215', title: 'Computer Networks & Internet Technology', creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 1, prerequisites: ['COM122'] },

  { courseCode: 'COM221', title: 'Software Engineering Principles', creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: ['COM211', 'COM214'] },
  { courseCode: 'COM222', title: 'Web Technology II (Fullstack)', creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: ['COM213'] },
  { courseCode: 'COM223', title: 'Network Security & Administration', creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: ['COM215'] },
  { courseCode: 'COM224', title: 'Computer Project Seminar', creditUnits: 2, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: [] },
  { courseCode: 'COM225', title: 'Industrial Training SIWES Report', creditUnits: 3, department: 'Computer Science', level: 'ND 2', semester: 2, prerequisites: [] },
];

export const NCC_COURSES: Course[] = [
  { courseCode: 'NCC311', title: 'Advanced Computer Networks', creditUnits: 3, department: 'Computer Science', level: 'HND 1', semester: 1, prerequisites: [] },
  { courseCode: 'NCC312', title: 'Cloud Computing Architecture', creditUnits: 3, department: 'Computer Science', level: 'HND 1', semester: 1, prerequisites: [] },
  { courseCode: 'NCC313', title: 'Network Security', creditUnits: 2, department: 'Computer Science', level: 'HND 1', semester: 1, prerequisites: [] },
  
  { courseCode: 'NCC321', title: 'Routing & Switching', creditUnits: 3, department: 'Computer Science', level: 'HND 1', semester: 2, prerequisites: ['NCC311'] },
  { courseCode: 'NCC322', title: 'Cloud Infrastructure Management', creditUnits: 3, department: 'Computer Science', level: 'HND 1', semester: 2, prerequisites: ['NCC312'] },
  
  { courseCode: 'NCC411', title: 'Wireless Networks', creditUnits: 3, department: 'Computer Science', level: 'HND 2', semester: 1, prerequisites: ['NCC321'] },
  { courseCode: 'NCC412', title: 'DevOps & Cloud Automation', creditUnits: 3, department: 'Computer Science', level: 'HND 2', semester: 1, prerequisites: ['NCC322'] },
];

export const SWD_COURSES: Course[] = [
  { courseCode: 'SWD311', title: 'Advanced Software Engineering', creditUnits: 3, department: 'Computer Science', level: 'HND 1', semester: 1, prerequisites: [] },
  { courseCode: 'SWD312', title: 'Full Stack Web Development', creditUnits: 3, department: 'Computer Science', level: 'HND 1', semester: 1, prerequisites: [] },
  { courseCode: 'SWD313', title: 'Database Design & Implementation', creditUnits: 2, department: 'Computer Science', level: 'HND 1', semester: 1, prerequisites: [] },
  
  { courseCode: 'SWD321', title: 'Mobile Application Development', creditUnits: 3, department: 'Computer Science', level: 'HND 1', semester: 2, prerequisites: ['SWD312'] },
  { courseCode: 'SWD322', title: 'Software Project Management', creditUnits: 3, department: 'Computer Science', level: 'HND 1', semester: 2, prerequisites: ['SWD311'] },
  
  { courseCode: 'SWD411', title: 'Enterprise Architecture', creditUnits: 3, department: 'Computer Science', level: 'HND 2', semester: 1, prerequisites: ['SWD321'] },
  { courseCode: 'SWD412', title: 'API Design & Integration', creditUnits: 3, department: 'Computer Science', level: 'HND 2', semester: 1, prerequisites: ['SWD312'] },
];

export const ALL_COURSES: Course[] = [...ND_COURSES, ...NCC_COURSES, ...SWD_COURSES];

export const getDefaultCourses = (program: string = '', level: string = ''): Course[] => {
  let applicableCourses: Course[] = [];

  if (program.includes('Networking')) {
    applicableCourses = NCC_COURSES;
  } else if (program.includes('Software')) {
    applicableCourses = SWD_COURSES;
  } else {
    applicableCourses = ND_COURSES;
  }

  // Filter based on level
  if (level.includes('1')) {
    return applicableCourses.filter(c => c.level === 'ND 1' || c.level === 'HND 1');
  } else if (level.includes('2')) {
    // If level 2, include level 1 courses as well (for carryovers / full transcript view)
    return applicableCourses.filter(c => 
      c.level === 'ND 1' || c.level === 'ND 2' || c.level === 'HND 1' || c.level === 'HND 2'
    );
  }
  
  return applicableCourses;
};
