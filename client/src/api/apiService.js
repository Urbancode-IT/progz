import API from "./api";

// ---------- USERS ----------
export const fetchStudents = () => API.get("/users/role?role=student").then(res => res.data);
export const fetchInstructors = () => API.get("/users/role/instructor").then(res => res.data);
export const fetchUsers = () => API.get("/users").then(res => res.data);

// ---------- COURSES ----------
export const fetchCourses = () => API.get("/courses").then(res => res.data);
export const fetchCourseById = (id) => API.get(`/courses/${id}`).then(res => res.data);
export const addInstructorToCourse = (courseId, instructorId) =>
  API.post(`/courses/${courseId}/add-instructor`, { instructorId }).then(res => res.data);

// ---------- BATCHES ----------
export const fetchBatchesByCourse = (courseId) =>
  API.get(`/progress/batches/by-course/${courseId}`).then(res => res.data);
export const createBatch = (batchData) =>
  API.post("/progress/batch", batchData).then(res => res.data);

// ---------- ENROLLMENT ----------
export const enrollStudent = (enrollData) =>
  API.post("/courses/enroll", enrollData).then(res => res.data);

// ---------- MISC ----------
export const approveUser = (userId) =>
  API.post(`/users/approve/${userId}`).then(res => res.data);
export const deleteUser = (userId) =>
  API.delete(`/users/${userId}`).then(res => res.data);
