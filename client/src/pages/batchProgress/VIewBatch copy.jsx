import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/api";

const ViewBatch = () => {
  const { batchId } = useParams();
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  const courseId = batchData?.course?._id;

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await API.get(`/progress/batch/view/${batchId}`);
        setBatchData(res.data);
      } catch (err) {
        console.error("Error fetching batch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Batch: {batchData?.name}</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="py-2 px-4">#</th>
            <th className="py-2 px-4">Student Name</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {batchData?.students?.map((student, index) => (
            <tr key={student._id} className="border-t">
              <td className="py-2 px-4">{index + 1}</td>
              <td className="py-2 px-4">{student.name}</td>
              <td className="py-2 px-4">{student.email}</td>
              <td className="py-2 px-4">
                <Link
                  to={`/student-progress-ipov/${student._id}/${courseId}`}
                  className="text-blue-500 hover:underline"
                >
                  View Progress
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

          

    </div>
  );
};

export default ViewBatch;
