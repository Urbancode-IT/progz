import React, { useState, useEffect } from 'react';
import API from '../../api/api';

const CreateStudentBillForm = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    student: '',
    baseFee: '',
    finalFee: '',
    discountReason: '',
    courseSplits: [],
    firstInstallment: {
      amount: '',
      paymentMode: 'cash',
      transactionId: '',
      note: ''
    },
    processedBy: '',
    note: ''
  });

  const fetchStudents = async () => {
    try {
      const { data } = await API.get('/users/role?role=student');
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      
    }
  };
  const fetchCourses = async () => {
      const res = await API.get("/courses");
      setCourses(res.data);
    };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const handleCourseSplitChange = (index, field, value) => {
    const updatedSplits = [...formData.courseSplits];
    updatedSplits[index][field] = value;
    setFormData({ ...formData, courseSplits: updatedSplits });
  };

  const addCourseSplit = () => {
    setFormData({
      ...formData,
      courseSplits: [...formData.courseSplits, { course: '', instructor: '', shareAmount: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanData = {
      ...formData,
      baseFee: Number(formData.baseFee),
      finalFee: Number(formData.finalFee),
      courseSplits: formData.courseSplits.map(cs => ({
        ...cs,
        shareAmount: Number(cs.shareAmount)
      })),
      firstInstallment: {
        ...formData.firstInstallment,
        amount: Number(formData.firstInstallment.amount)
      }
    };

    try {
      const res = await API.post('/payments/bill/create', cleanData);
      alert('Bill created successfully!');
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert('Error creating bill');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Create Student Bill</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label>Student:</label>
          <select value={formData.student} onChange={e => setFormData({ ...formData, student: e.target.value })} className="w-full border p-2">
            <option value="">-- Select Student --</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Base Fee:</label>
            <input type="number" className="w-full border p-2" value={formData.baseFee} onChange={e => setFormData({ ...formData, baseFee: e.target.value })} />
          </div>
          <div>
            <label>Final Fee (after discount):</label>
            <input type="number" className="w-full border p-2" value={formData.finalFee} onChange={e => setFormData({ ...formData, finalFee: e.target.value })} />
          </div>
        </div>

        <div>
          <label>Discount Reason:</label>
          <input type="text" className="w-full border p-2" value={formData.discountReason} onChange={e => setFormData({ ...formData, discountReason: e.target.value })} />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Course Splits</h3>
          {formData.courseSplits.map((split, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mb-2">
              <select value={split.course} onChange={e => handleCourseSplitChange(index, 'course', e.target.value)} className="border p-2">
                <option value="">-- Select Course --</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.courseName}</option>)}
              </select>

              <select value={split.instructor} onChange={e => handleCourseSplitChange(index, 'instructor', e.target.value)} className="border p-2">
                <option value="">-- Select Instructor --</option>
                {courses.find(c => c._id === split.course)?.instructor?.map(i => (
                  <option key={i._id} value={i._id}>{i.name}</option>
                ))}
              </select>

              <input type="number" placeholder="Amount" className="border p-2" value={split.shareAmount} onChange={e => handleCourseSplitChange(index, 'shareAmount', e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={addCourseSplit} className="text-blue-600 underline">+ Add Course Split</button>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">First Installment</h3>
          <div className="grid grid-cols-3 gap-4">
            <input type="number" placeholder="Amount" className="border p-2" value={formData.firstInstallment.amount} onChange={e => setFormData({ ...formData, firstInstallment: { ...formData.firstInstallment, amount: e.target.value } })} />
            <select className="border p-2" value={formData.firstInstallment.paymentMode} onChange={e => setFormData({ ...formData, firstInstallment: { ...formData.firstInstallment, paymentMode: e.target.value } })}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank transfer">Bank Transfer</option>
            </select>
            <input type="text" placeholder="Transaction ID" className="border p-2" value={formData.firstInstallment.transactionId} onChange={e => setFormData({ ...formData, firstInstallment: { ...formData.firstInstallment, transactionId: e.target.value } })} />
          </div>
          <input type="text" placeholder="Installment Note" className="w-full border p-2 mt-2" value={formData.firstInstallment.note} onChange={e => setFormData({ ...formData, firstInstallment: { ...formData.firstInstallment, note: e.target.value } })} />
        </div>

        <div>
          <label>Processed By:</label>
          <input type="text" className="w-full border p-2" value={formData.processedBy} onChange={e => setFormData({ ...formData, processedBy: e.target.value })} />
        </div>

        <div>
          <label>Admin Note:</label>
          <textarea className="w-full border p-2" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })}></textarea>
        </div>

        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">Create Bill</button>
      </form>
    </div>
  );
};

export default CreateStudentBillForm;
