import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import Modal from "react-modal";
import API from "../../api/api";

const StudentViewProgress = () => {
  const { studentId, courseId } = useParams();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showContentModal, setShowContentModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });
  const [modules, setModules] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Function to download content as PDF
  const downloadAsPDF = (title, content) => {
    const doc = new jsPDF();
    doc.text(title, 10, 10);
    doc.text(content, 10, 20);
    doc.save(`${title}.pdf`);
  };

  const handleBlobDownload = async (url, filename = "downloaded-file") => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert("Download failed. Please try again.");
      console.error("Download error:", error);
    }
  };

  // Function to extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(
          `/progress/${studentId}/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProgressData(res.data);
      } catch (err) {
        console.error("Error fetching progress:", err);
        setError("Failed to load course progress");
      } finally {
        setLoading(false);
      }
    };

    const fetchProgressPercentage = async () => {
      try {
        const { data } = await API.get(`/progress/${studentId}/${courseId}`);
        setModules(data.modules);

        // Calculate progress from sections
        let total = 0;
        let completed = 0;

        data.modules.forEach((mod) => {
          mod.sections.forEach((sec) => {
            total++;
            if (sec.isCompleted) completed++;
          });
        });

        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        setProgressPercentage(percent);
      } catch (err) {
        console.error("Failed to load progress", err);
      }
    };

    fetchProgress();
    fetchProgressPercentage();
  }, [studentId, courseId]);

  const openContentModal = (title, content) => {
    setModalContent({ title, content });
    setShowContentModal(true);
  };
  console.log(progressData);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
          <div className="text-red-600 font-medium">{error}</div>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl overflow-hidden rounded-lg sm:rounded-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-600 to-gray-500 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="max-w-full overflow-hidden">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-serif truncate">{progressData.courseName}</h1>
                <p className="text-sm sm:text-base text-gray-200 mt-1">Course Progress</p>
                
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:text-gray-200 transition-colors self-end sm:self-auto"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            

            {/* Progress Modules */}
            <div className="mb-8">
              
              <div className="mb-6">
                <h2 className="text-xl text-gray-800 sm:text-2xl mb-2  mb-4">{progressData.student.name}'s Progresss</h2>
                <div className="w-full bg-gray-300 rounded-full h-4 sm:h-6">
                  <div
                    className="bg-blue-800 h-full text-white text-xs sm:text-sm font-semibold text-center rounded-full transition-all duration-300 flex items-center justify-center"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    {progressPercentage >= 50 && `${progressPercentage}%`}
                  </div>
                </div>
                {progressPercentage < 50 && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 text-right">{progressPercentage}% completed</p>
                )}
              </div>

              {progressData.modules.map((module, modIdx) => (
                <div key={modIdx} className="border border-gray-200 rounded-lg p-3 sm:p-5 bg-gray-50 mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3">
                    Module {modIdx + 1}: {module.title}
                  </h3>
                  
                  {module.sections.map((section, secIdx) => (
                    <div key={secIdx} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">{section.sectionName}</h4>
                          {section.isCompleted && section.completionTime && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              Completed on: {new Date(section.completionTime).toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm ${
                          section.isCompleted 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {section.isCompleted ? "Completed" : "Yet to Start"}
                        </span>
                      </div>

                      {/* Learning Materials */}
                      <div className="mb-4 sm:mb-6">
                        <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Learning Materials
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 hidden sm:table-header-group">
                              <tr>
                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Content
                                </th>
                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {/* Learning Material Notes */}
                              {section.learningMaterialNotes && (
                                <tr className="flex flex-col sm:table-row">
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Notes
                                  </td>
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {section.learningMaterialNotes.length > 50
                                      ? `${section.learningMaterialNotes.substring(0, 50)}...`
                                      : section.learningMaterialNotes}
                                  </td>
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                    <button
                                      onClick={() =>
                                        section.isCompleted && 
                                        openContentModal(
                                          `${section.sectionName} - Learning Material Notes`,
                                          section.learningMaterialNotes
                                        )
                                      }
                                      disabled={!section.isCompleted}
                                      className={`${section.isCompleted 
                                        ? "text-blue-600 hover:text-blue-800 cursor-pointer" 
                                        : "text-gray-400 cursor-not-allowed"}`}
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() =>
                                        section.isCompleted &&
                                        downloadAsPDF(
                                          `${section.sectionName} - Learning Material Notes`,
                                          section.learningMaterialNotes
                                        )
                                      }
                                      disabled={!section.isCompleted}
                                      className={`${section.isCompleted 
                                        ? "text-green-600 hover:text-gray-800 cursor-pointer" 
                                        : "text-green-400 cursor-not-allowed"}`}
                                    >
                                      Download
                                    </button>
                                  </td>
                                </tr>
                              )}
                              {/* Learning Material Files */}
                              {section.learningMaterialUrls?.map((url, urlIdx) => (
                                <tr key={`lm-${urlIdx}`} className="flex flex-col sm:table-row">
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Learning Material {urlIdx + 1}
                                  </td>
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 max-w-xs truncate">
                                    <span className="text-blue-600">
                                      File Type: {url.split(".").pop().split(/\#|\?/)[0].toUpperCase()} file
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                    <a
                                      href={section.isCompleted ? url : "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`${section.isCompleted 
                                        ? "text-blue-600 hover:text-blue-800 cursor-pointer" 
                                        : "text-gray-400 cursor-not-allowed pointer-events-none"}`}
                                    >
                                      View
                                    </a>
                                    <button
                                      onClick={() =>
                                        section.isCompleted &&
                                        handleBlobDownload(url, `file-${urlIdx + 1}`)
                                      }
                                      disabled={!section.isCompleted}
                                      className={`${section.isCompleted 
                                        ? "text-green-600 hover:text-green-800 cursor-pointer" 
                                        : "text-gray-400 cursor-not-allowed"}`}
                                    >
                                      Download
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Code Challenges */}
                      <div className="mb-4 sm:mb-6">
                        <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          Code Challenges
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 hidden sm:table-header-group">
                              <tr>
                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Content
                                </th>
                                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {/* Code Challenge Instructions */}
                              {section.codeChallengeInstructions && (
                                <tr className="flex flex-col sm:table-row">
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Instructions
                                  </td>
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {section.codeChallengeInstructions.length > 50
                                      ? `${section.codeChallengeInstructions.substring(0, 50)}...`
                                      : section.codeChallengeInstructions}
                                  </td>
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                    <button
                                      onClick={() =>
                                        section.isCompleted &&
                                        openContentModal(
                                          `${section.sectionName} - Code Challenge Instructions`,
                                          section.codeChallengeInstructions
                                        )
                                      }
                                      disabled={!section.isCompleted}
                                      className={`${section.isCompleted 
                                        ? "text-blue-600 hover:text-blue-800 cursor-pointer" 
                                        : "text-gray-400 cursor-not-allowed"}`}
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() =>
                                        section.isCompleted &&
                                        downloadAsPDF(
                                          `${section.sectionName} - Code Challenge Instructions`,
                                          section.codeChallengeInstructions
                                        )
                                      }
                                      disabled={!section.isCompleted}
                                      className={`${section.isCompleted 
                                        ? "text-green-600 hover:text-gray-800 cursor-pointer" 
                                        : "text-gray-400 cursor-not-allowed"}`}
                                    >
                                      Download
                                    </button>
                                  </td>
                                </tr>
                              )}
                              {/* Code Challenge Files */}
                              {section.codeChallengeUrls?.map((url, urlIdx) => (
                                <tr key={`cc-${urlIdx}`} className="flex flex-col sm:table-row">
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Code Challenge {urlIdx + 1}
                                  </td>
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 max-w-xs truncate">
                                    <span className="text-blue-600">
                                      File Type: {url.split(".").pop().split(/\#|\?/)[0].toUpperCase()} file
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                    <a
                                      href={section.isCompleted ? url : "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`${section.isCompleted 
                                        ? "text-blue-600 hover:text-blue-800 cursor-pointer" 
                                        : "text-gray-400 cursor-not-allowed pointer-events-none"}`}
                                    >
                                      View
                                    </a>
                                    <button
                                      onClick={() =>
                                        section.isCompleted &&
                                        handleBlobDownload(url, `file-${urlIdx + 1}`)
                                      }
                                      disabled={!section.isCompleted}
                                      className={`${section.isCompleted 
                                        ? "text-green-600 hover:text-gray-800 cursor-pointer" 
                                        : "text-gray-400 cursor-not-allowed"}`}
                                    >
                                      Download
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Video References */}
                      {section.videoReferences?.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 sm:mb-3 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Video References
                          </h5>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50 hidden sm:table-header-group">
                                <tr>
                                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Video
                                  </th>
                                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Preview
                                  </th>
                                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {section.videoReferences.map((url, urlIdx) => {
                                  const videoId = getYouTubeId(url);
                                  return (
                                    <tr key={`vr-${urlIdx}`} className="flex flex-col sm:table-row">
                                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        Reference Video {urlIdx + 1}
                                      </td>
                                      <td className="px-3 py-2 sm:px-6 sm:py-4">
                                        {videoId ? (
                                          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                                            <iframe
                                              className="absolute top-0 left-0 w-full h-full"
                                              src={`https://www.youtube.com/embed/${videoId}`}
                                              frameBorder="0"
                                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                              allowFullScreen
                                              title={`Video ${urlIdx + 1}`}
                                            ></iframe>
                                          </div>
                                        ) : (
                                          <span className="text-sm text-gray-500">
                                            Invalid YouTube URL
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a
                                          href={section.isCompleted ? url : "#"}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`${section.isCompleted 
                                            ? "text-blue-600 hover:text-blue-800 cursor-pointer" 
                                            : "text-gray-400 cursor-not-allowed pointer-events-none"}`}
                                        >
                                          Watch on YouTube
                                        </a>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Modal */}
      <Modal
        isOpen={showContentModal}
        onRequestClose={() => setShowContentModal(false)}
        contentLabel="Content Viewer"
        className="bg-white p-4 sm:p-6 rounded-xl shadow-xl max-w-2xl w-full mx-4 sm:mx-auto mt-10 sm:mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center p-4 sm:p-8"
      >
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">{modalContent.title}</h2>
          <button
            onClick={() => setShowContentModal(false)}
            className="text-gray-500 hover:text-gray-700 ml-2"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg whitespace-pre-line overflow-auto max-h-[50vh] sm:max-h-[60vh] text-sm sm:text-base">
          {modalContent.content || <span className="text-gray-500">No content available</span>}
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
          <button
            onClick={() => downloadAsPDF(modalContent.title, modalContent.content)}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={() => setShowContentModal(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentViewProgress;