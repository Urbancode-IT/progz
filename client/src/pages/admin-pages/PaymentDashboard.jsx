import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { saveAs } from 'file-saver';
import * as XLSX from "xlsx";
import AdminDashboard from "../dashboards/AdminDashboard";

const PaymentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [editDetails, setEditDetails] = useState({ mode: '', transactionId: '', processor: '', date: '' });
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ instructor: "", course: "", paymentMode: "" });

  // useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/payments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    }
  };

  const exportToExcel = () => {
    const data = [];
    courses.forEach(course => {
      course.enrolledStudents.forEach(student => {
        data.push({
          Instructor: course.instructor?.name || "N/A",
          Course: course.courseName,
          Student: student.student?.name || "N/A",
          Email: student.student?.email || "",
          Fee: student.courseFee,
          Commission: student.instructorCommission,
          Paid: student.paymentStatus ? "Yes" : "No",
          Mode: student.paymentMode || "",
          TxnID: student.transactionId || "",
          Processor: student.processedBy || "",
          Date: student.paymentDate ? new Date(student.paymentDate).toLocaleDateString() : "",
          Completed: student.courseCompleted ? "Yes" : "No"
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "instructor_payments.xlsx");
  };

  const openModal = (student, courseId) => {
    setSelected({ ...student, courseId, studentId: typeof student.student === 'object' ? student.student._id : student.student });
    setEditDetails({
      mode: student.paymentMode || '',
      transactionId: student.transactionId || '',
      processor: student.processedBy || '',
      date: student.paymentDate?.substring(0, 10) || ''
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.put(`/admin/update-payment/${selected.courseId}/${selected.studentId}`, editDetails, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const resetFilters = () => {
    setFilters({ instructor: "", course: "", paymentMode: "" });
    setFilterStatus("all");
    setSearchTerm("");
  };

  const uniqueInstructors = [...new Set(courses.map(c => c.instructor?.name).filter(Boolean))];
  const uniqueCourses = [...new Set(courses.map(c => c.courseName).filter(Boolean))];
  const uniquePaymentModes = [...new Set(courses.flatMap(c => c.enrolledStudents.map(s => s.paymentMode).filter(Boolean)))];

  const filteredCourses = courses.map(course => ({
    ...course,
    enrolledStudents: course.enrolledStudents.filter(student => {
      const statusMatch = filterStatus === "all" ? true : filterStatus === "paid" ? student.paymentStatus === "completed" : student.paymentStatus !== "completed";
      const searchMatch = course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
      const instructorMatch = !filters.instructor || course.instructor?.name === filters.instructor;
      const courseMatch = !filters.course || course.courseName === filters.course;
      const paymentModeMatch = !filters.paymentMode || student.paymentMode === filters.paymentMode;
      return statusMatch && searchMatch && instructorMatch && courseMatch && paymentModeMatch;
    })
  })).filter(course => course.enrolledStudents.length > 0);

  let index = 1;

  return (
    <AdminDashboard>
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl text-center text-red-600">xxxxx Page Under Construction xxxxx</h1>
      <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
        
        <h1 className="text-xl font-bold">Instructor Payments</h1>
        <button onClick={exportToExcel} className="px-4 py-2 border border-gray-300 rounded">Export to Excel</button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 border px-3 py-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border px-3 py-2 rounded">
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <button onClick={resetFilters} className="border px-3 py-2 rounded">Reset</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <select value={filters.instructor} onChange={(e) => setFilters({ ...filters, instructor: e.target.value })} className="border px-3 py-2 rounded">
          <option value="">All Instructors</option>
          {uniqueInstructors.map(i => <option key={i}>{i}</option>)}
        </select>
        <select value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })} className="border px-3 py-2 rounded">
          <option value="">All Courses</option>
          {uniqueCourses.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filters.paymentMode} onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })} className="border px-3 py-2 rounded">
          <option value="">All Payment Modes</option>
          {uniquePaymentModes.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              {/* <th className="px-3 py-2 text-left">Instructor</th> */}
              <th className="px-3 py-2 text-left">Course</th>
              <th className="px-3 py-2 text-left">Student</th>
              <th className="px-3 py-2 text-left">Total Fee</th>
              <th className="px-3 py-2 text-left">Instructor</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Payment Info</th>
              <th className="px-3 py-2 text-right">Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.flatMap(course => course.enrolledStudents.map(student => (
              <tr key={student._id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{index++}</td>
                {/* <td className="px-3 py-2">{course.instructor?.name}</td> */}
                <td className="px-3 py-2">{course.courseName}</td>
                <td className="px-3 py-2">{student.student?.name}</td>
                <td className="px-3 py-2">₹{student.courseFee}</td>
                <td className="px-3 py-2">₹{student.instructorCommission}</td>
                <td className="px-3 py-2">{student.courseCompleted ? "Completed" : "In Progress"}</td>
                <td className="px-3 py-2">{student.paymentStatus || "Not Paid"}</td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => openModal(student, course._id)} className="text-blue-600">Edit</button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Update Payment Details</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Mode" value={editDetails.mode} onChange={(e) => setEditDetails({ ...editDetails, mode: e.target.value })} className="w-full border px-3 py-2 rounded" />
              <input type="text" placeholder="Transaction ID" value={editDetails.transactionId} onChange={(e) => setEditDetails({ ...editDetails, transactionId: e.target.value })} className="w-full border px-3 py-2 rounded" />
              <input type="text" placeholder="Processed By" value={editDetails.processor} onChange={(e) => setEditDetails({ ...editDetails, processor: e.target.value })} className="w-full border px-3 py-2 rounded" />
              <input type="date" value={editDetails.date} onChange={(e) => setEditDetails({ ...editDetails, date: e.target.value })} className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminDashboard>
  );
};

export default PaymentDashboard;
