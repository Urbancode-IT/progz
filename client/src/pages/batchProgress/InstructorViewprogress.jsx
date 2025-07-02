import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../../assets/icon.png";
import API from "../../api/api";

const InstructorViewProgress = () => {
  const { studentId, courseId } = useParams();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const  [currentTime, setCurrentTime] = useState(new Date());

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/progress/${studentId}/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
  useEffect(()=>{
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  },[]);

  useEffect(() => {
    fetchProgress();
  }, [studentId, courseId]);

  const handleCheckboxChange = async (moduleIndex, sectionIndex, checked) => {
    try {
      const token = localStorage.getItem("token");

      const updatedModules = [...progressData.modules];
      updatedModules[moduleIndex].sections[sectionIndex].isCompleted = checked;
      updatedModules[moduleIndex].sections[sectionIndex].completionTime = checked
        ? new Date().toISOString()
        : null;
      setProgressData({ ...progressData, modules: updatedModules });

      await API.put(
        `/progress/${studentId}/${courseId}`,
        { moduleIndex, sectionIndex, isCompleted: checked },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchProgress();
    } catch (err) {
      console.error("Failed to update progress", err);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return (
    <div className="p-6">
      <p className="text-red-600">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-4 border px-4 py-2 rounded">
        Go Back
      </button>
    </div>
  );

  return (
    <div className=" mx-auto  min-h-screen w-full bg-gray-50 bg-[url('/Login.jpg')] bg-cover bg-center">
      <header className="bg-gradient-to-b from-indigo-300 to-gray-100 border-t mb-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3 sm:gap-0">
                        <div className="flex items-center gap-4 cursor-pointer" >
                          <img
                            src={logo}
                            alt="Logo"
                            className="h-10 w-10 rounded-lg object-contain"
                            onClick={() => navigate("/instructor")}
                          />
                          <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                              ProgZ
                            </h1>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <span>Instructor Dashboard</span>
                              <span className="hidden md:inline">•</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:block px-3 py-1.5 text-gray-600 rounded-full text-sm font-medium">
                            <span className="hidden md:inline">
                              {currentTime.toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <br />
                            {currentTime.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </header>
      <div className="mb-4 max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold">{progressData.courseName}</h1>
        <p>Student: {studentName} ({studentEmail})</p>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {progressData.modules.map((module, modIdx) => (
          <div key={modIdx} className="border border-gray-400 p-4 rounded-xl bg-white/50 backdrop-blur-sm shadow-md">
            <h2 className="font-medium mb-2">
              Module {modIdx + 1}: {module.title}
            </h2>

            <ul className="space-y-2">
              {module.sections.map((section, secIdx) => (
                <li key={secIdx} className="flex justify-between items-center border border-gray-800 p-2 rounded">
                  <span>{section.sectionName}</span>
                  <div className="flex items-center gap-4">
                    <label className="text-sm">
                      {section.isCompleted ? "Completed" : "Not Started"}
                      {section.completionTime && (
                        <div className="text-xs text-gray-500">
                          {new Date(section.completionTime).toLocaleString()}
                        </div>
                      )}
                    </label>
                    <input
                      type="checkbox"
                      checked={section.isCompleted}
                      onChange={(e) =>
                        handleCheckboxChange(modIdx, secIdx, e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorViewProgress;
