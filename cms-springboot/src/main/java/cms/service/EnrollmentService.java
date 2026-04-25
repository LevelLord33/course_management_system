package cms.service;

import cms.model.*;
import cms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    @Autowired EnrollmentRepository enrollRepo;
    @Autowired StudentRepository    studentRepo;
    @Autowired CourseRepository     courseRepo;

    @Transactional
    public synchronized Map<String,Object> enroll(Long studentId, Long courseId) {
        Student s = studentRepo.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        Course c = courseRepo.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        if (enrollRepo.existsByStudentIdAndCourseId(studentId, courseId))
            throw new RuntimeException("Student is already enrolled in this course");
        if (!c.isAvailable())
            throw new RuntimeException("Course is full — no seats available");
        Enrollment e = enrollRepo.save(new Enrollment(s, c));
        Map<String,Object> r = new LinkedHashMap<>();
        r.put("message", "Enrolled successfully"); r.put("enrollmentId", e.getId());
        return r;
    }

    @Transactional
    public void withdraw(Long studentId, Long courseId) {
        if (!enrollRepo.existsByStudentIdAndCourseId(studentId, courseId))
            throw new RuntimeException("Enrollment not found");
        enrollRepo.deleteByStudentIdAndCourseId(studentId, courseId);
    }

    @Transactional
    public Map<String,Object> updateGrade(Long enrollmentId, String grade) {
        Enrollment e = enrollRepo.findById(enrollmentId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        e.setGrade(grade);
        enrollRepo.save(e);
        Map<String,Object> r = new LinkedHashMap<>();
        r.put("message","Grade updated"); r.put("grade", grade);
        return r;
    }

    @Transactional(readOnly = true)
    public List<Map<String,Object>> forCourse(Long courseId) {
        return enrollRepo.findByCourseId(courseId).stream().map(e -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("enrollmentId", e.getId());
            m.put("studentId",    e.getStudent().getId());
            m.put("studentName",  e.getStudent().getName());
            m.put("rollNo",       e.getStudent().getRollNo());
            m.put("email",        e.getStudent().getEmail());
            m.put("department",   e.getStudent().getDepartment());
            m.put("grade",        e.getGrade());
            m.put("status",       e.getStatus());
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String,Object>> forStudent(Long studentId) {
        return enrollRepo.findByStudentId(studentId).stream().map(e -> {
            Map<String,Object> m = new LinkedHashMap<>();
            m.put("enrollmentId", e.getId());
            m.put("courseId",     e.getCourse().getId());
            m.put("courseCode",   e.getCourse().getCourseCode());
            m.put("courseName",   e.getCourse().getCourseName());
            m.put("credits",      e.getCourse().getCredits());
            m.put("instructor",   e.getCourse().getInstructor());
            m.put("grade",        e.getGrade());
            m.put("status",       e.getStatus());
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String,Object> stats() {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("totalCourses",     courseRepo.count());
        m.put("totalStudents",    studentRepo.count());
        m.put("totalEnrollments", enrollRepo.count());
        m.put("availableCourses", courseRepo.findAvailableCourses().size());
        return m;
    }
}
