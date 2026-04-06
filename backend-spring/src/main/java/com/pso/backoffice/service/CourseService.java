package com.pso.backoffice.service;

import com.pso.backoffice.entity.Course;
import com.pso.backoffice.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    public List<Course> listCourses(String name) {
        return courseRepository.findByNameContainingIgnoreCase(name != null && !name.isBlank() ? name : null);
    }

    public Course getCourse(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public Course createCourse(Map<String, Object> body) {
        Course course = new Course();
        course.setName((String) body.get("name"));
        return courseRepository.save(course);
    }

    public Course updateCourse(UUID id, Map<String, Object> body) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (body.containsKey("name") && body.get("name") != null) {
            course.setName((String) body.get("name"));
        }
        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(UUID id) {
        courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        courseRepository.deleteById(id);
    }
}
