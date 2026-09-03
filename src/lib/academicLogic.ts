import { Course, Enrollment, Curriculum } from '../types';

export const calculateCGPA = (enrollments: Enrollment[], courses: Course[]) => {
  let totalPoints = 0;
  let totalCredits = 0;

  const gradePoints: Record<string, number> = {
    'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0
  };

  enrollments.forEach(enc => {
    if (enc.grade && enc.status !== 'pending' && enc.status !== 'in_progress') {
      const course = courses.find(c => c.courseCode === enc.courseCode);
      if (course) {
        const points = gradePoints[enc.grade] ?? 0;
        totalPoints += points * course.creditUnits;
        totalCredits += course.creditUnits;
      }
    }
  });

  return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
};

export const getDegreeAudit = (enrollments: Enrollment[], curriculum: Curriculum | null, courses: Course[]) => {
  const passedEnrollments = enrollments.filter(e => e.status === 'passed');
  const passedCourseCodes = passedEnrollments.map(e => e.courseCode);

  let requiredCredits = 0;
  let completedCredits = 0;

  if (curriculum && curriculum.courses.length > 0) {
    curriculum.courses.forEach(req => {
      const course = courses.find(c => c.courseCode === req.courseCode);
      if (course) {
        requiredCredits += course.creditUnits;
        if (passedCourseCodes.includes(course.courseCode)) {
          completedCredits += course.creditUnits;
        }
      }
    });
  } else if (courses.length > 0) {
    courses.forEach(course => {
      requiredCredits += course.creditUnits;
      if (passedCourseCodes.includes(course.courseCode)) {
        completedCredits += course.creditUnits;
      }
    });
  }

  // Default to 48 required credits if still 0
  if (requiredCredits === 0) requiredCredits = 48;

  const percentage = requiredCredits > 0 ? Math.round((completedCredits / requiredCredits) * 100) : 0;

  return {
    completedCredits,
    requiredCredits,
    percentage,
    passedCourseCodes
  };
};

export const getCourseRecommendations = (
  enrollments: Enrollment[], 
  _curriculum: Curriculum | null, 
  courses: Course[], 
  currentLevel: string
) => {
  const passedCourseCodes = enrollments.filter(e => e.status === 'passed').map(e => e.courseCode);
  const failedCourseCodes = enrollments.filter(e => e.status === 'failed').map(e => e.courseCode);
  
  const recommendations: (Course & { reason: string })[] = [];
  let totalCredits = 0;
  const MAX_CREDITS = 24;

  // 1. Priority: Carryover (Failed) courses
  failedCourseCodes.forEach(code => {
    const course = courses.find(c => c.courseCode === code);
    if (course && totalCredits + course.creditUnits <= MAX_CREDITS) {
      recommendations.push({ ...course, reason: 'Carryover' });
      totalCredits += course.creditUnits;
    }
  });

  // 2. Next: Departmental courses for the current level that haven't been passed
  const targetLevel = currentLevel.includes('2') ? 'ND 2' : 'ND 1';
  const levelCourses = courses.filter(c => c.level === targetLevel || c.level === currentLevel);
  
  levelCourses.forEach(course => {
    if (!passedCourseCodes.includes(course.courseCode) && !failedCourseCodes.includes(course.courseCode)) {
      // Check prerequisites
      const prereqsMet = course.prerequisites.every(prereq => passedCourseCodes.includes(prereq));
      if (prereqsMet && totalCredits + course.creditUnits <= MAX_CREDITS) {
        recommendations.push({ ...course, reason: 'Required for Level' });
        totalCredits += course.creditUnits;
      }
    }
  });

  return recommendations;
};
