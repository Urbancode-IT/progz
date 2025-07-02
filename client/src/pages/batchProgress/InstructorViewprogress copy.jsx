import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";

const InstructorViewProgress = () => {
  const { studentId, courseId } = useParams();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/progress/${studentId}/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Progress data:", res.data);
      setProgressData(res.data);
      setStudentName(res.data.student.name);
      setStudentEmail(res.data.student.email);
    } catch (err) {
      console.error("Error fetching progress:", err);
      setError("Failed to load course progress");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProgress();
  }, [studentId, courseId]);

  const handleCheckboxChange = async (moduleIndex, sectionIndex, checked) => {
    try {
      const token = localStorage.getItem("token");

      // Optimistically update state
      const updatedModules = [...progressData.modules];
      updatedModules[moduleIndex].sections[sectionIndex].isCompleted = checked;
      updatedModules[moduleIndex].sections[sectionIndex].completionTime =
        checked ? new Date().toISOString() : null;
      setProgressData({ ...progressData, modules: updatedModules });

      // Then call API
      await API.put(
        `/progress/${studentId}/${courseId}`,
        { moduleIndex, sectionIndex, isCompleted: checked },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optionally re-fetch to sync
      await fetchProgress();
    } catch (err) {
      console.error("Failed to update progress", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 to-gray-400 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-purple-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading progress data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 to-gray-400 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
          <div className="text-red-600 font-medium">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-gray-400 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-400 to-blue-400 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white font-serif">
                  {progressData.courseName}
                </h1>
                <p className="text-purple-100 mt-1 font-light">
                  Student Progress
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Student Information
              </h3>
              <div className="flex items-center">
                <div className="bg-purple-100 text-purple-800 rounded-full p-3 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{studentName}</p>
                  <p className="text-gray-600 text-sm">{studentEmail}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Progress Tracking
              </h2>

              {progressData.modules.map((module, modIdx) => (
                <div
                  key={modIdx}
                  className="border border-gray-200 rounded-xl p-6 bg-gray-50 mb-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">
                    Module {modIdx + 1}: {module.title}
                  </h3>

                  {module.sections.map((section, secIdx) => {
                    const isCompleted = section.isCompleted;
                    const statusText = isCompleted
                      ? "Completed"
                      : "Yet to Start";
                    const statusColor = isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700";

                    return (
                      <div
                        key={secIdx}
                        className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border hover:shadow-md transition-shadow"
                      >
                        <div className="text-gray-800">
                          <h4 className="font-medium text-base">
                            {section.sectionName}
                          </h4>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Status */}
                          <div className="flex flex-col items-end text-sm text-right">
                            <span
                              className={`px-3 py-1 rounded-full font-medium ${statusColor}`}
                            >
                              {statusText}
                            </span>
                            {section.completionTime && (
                              <span className="text-gray-500 text-xs mt-1">
                                {new Date(
                                  section.completionTime
                                ).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            disabled={loading}
                            onChange={(e) =>
                              handleCheckboxChange(
                                modIdx,
                                secIdx,
                                e.target.checked
                              )
                            }
                            className="w-5 h-5 accent-purple-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorViewProgress;
