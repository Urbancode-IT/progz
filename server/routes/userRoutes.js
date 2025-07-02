//server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers,getUserToEditById, updateUser, deleteUser,getUsersByRole ,bulkCreateUsers,getAllStudents,getAllInstructors, getInstructorPayments} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const allowRoles = require('../middlewares/roleMiddleware');
const { getMe } = require('../controllers/userController');

router.post('/register', registerUser); 
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.put('/:id',protect, allowRoles('admin','instructor'), updateUser);
router.get('/edit/:id',protect, allowRoles('admin','instructor'), getUserToEditById);
router.delete('/:id', deleteUser);
router.get('/me', protect, getMe);
router.get('/role', getUsersByRole);
router.get('/role/student', protect, allowRoles('admin','instructor'), getAllStudents);
router.get('/role/instructor',protect, allowRoles('admin','instructor'), getAllInstructors);
router.post('/bulk-create', protect, allowRoles('admin'), bulkCreateUsers);
router.get('/instructor/my-payments', protect, allowRoles('instructor'), getInstructorPayments);
module.exports = router;
