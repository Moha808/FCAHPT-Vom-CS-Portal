import { Course, Enrollment, Curriculum } from '../types';

export const calculateCGPA = (enrollments: Enrollment[], courses: Course[]) => {
  let totalPoints = 0;
  let totalCredits = 0;

  const gradePoints: Record<string, number> = {
    'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0
  };

  enrollments.forEach(enc => {
    if (enc.grade && enc.status !== 'pending') {
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
  if (!curriculum) return { completedCredits: 0, requiredCredits: 0, percentage: 0, passedCourses: [] };

  const passedEnrollments = enrollments.filter(e => e.status === 'passed');
  const passedCourseCodes = passedEnrollments.map(e => e.courseCode);

  let requiredCredits = 0;
  let completedCredits = 0;

  curriculum.courses.forEach(req => {
    const course = courses.find(c => c.courseCode === req.courseCode);
    if (course) {
      requiredCredits += course.creditUnits;
      if (passedCourseCodes.includes(course.courseCode)) {
        completedCredits += course.creditUnits;
      }
    }
  });

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
  curriculum: Curriculum | null, 
  courses: Course[], 
  currentLevel: string
) => {
  if (!curriculum) return [];

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

  // 2. Next: Curriculum courses for the current level that haven't been passed
  const levelRequirements = curriculum.courses.filter(req => req.level === currentLevel);
  
  levelRequirements.forEach(req => {
    if (!passedCourseCodes.includes(req.courseCode) && !failedCourseCodes.includes(req.courseCode)) {
      const course = courses.find(c => c.courseCode === req.courseCode);
      if (course) {
        // Check prerequisites
        const prereqsMet = course.prerequisites.every(prereq => passedCourseCodes.includes(prereq));
        if (prereqsMet && totalCredits + course.creditUnits <= MAX_CREDITS) {
          recommendations.push({ ...course, reason: 'Required for level' });
          totalCredits += course.creditUnits;
        }
      }
    }
  });

  return recommendations;
};
