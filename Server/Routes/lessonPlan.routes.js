const express = require('express');
const router = express.Router();
const lessonPlanController = require('../Controllers/lessonPlan.Controller');

// Lesson plan routes
router.post('/', lessonPlanController.createLessonPlan);
router.get('/teacher/:teacherId', lessonPlanController.getTeacherLessonPlans);
router.get('/:planId', lessonPlanController.getLessonPlanById);
router.put('/:planId', lessonPlanController.updateLessonPlan);
router.delete('/:planId', lessonPlanController.deleteLessonPlan);

// AI-generated lesson plan
router.post('/generate', lessonPlanController.generateLessonPlan);

module.exports = router;