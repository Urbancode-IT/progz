import { use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { jsPDF } from "jspdf";
import API from "../../api/api";
import logo from "../../assets/icon.png";

const ViewCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [showContentModal, setShowContentModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", content: "" });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [visibleSections, setVisibleSections] = useState({});


  const toggleSectionVisibility = (moduleIdx, sectionIdx) => {
  const key = `${moduleIdx}-${sectionIdx}`;
  setVisibleSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};

  useEffect(() => {
  const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getYouTubeId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const instructorId = user ? user._id : null;
  const instructor = user;

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

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await API.get(`/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load course details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleDeleteCourse = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      navigate(-1, { state: { message: "Course successfully deleted" } });
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete course"
      );
      setShowDeleteModal(false);
    }
  };

  const openContentModal = (title, content) => {
    setModalContent({ title, content });
    setShowContentModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-gray-600 mx-auto"
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
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
          <div className="text-red-600 font-medium">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center bg-gray-100 pt-12 font-sans">
    
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl overflow-hidden">
          {/* Course Header */}
          <div className="bg-gray-800 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white font-serif">
                  {course.courseName}
                </h1>
                <p className="text-gray-300 mt-1 font-light">
                  Course ID: {course.courseId}
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-white hover:text-gray-300 transition-colors"
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
            {/* Instructor Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Course Description:
              </h3>
              <div className="flex items-center">
                <div className="bg-gray-200 text-gray-800 rounded-full p-3 mr-4">
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
                  <p className="font-medium">{course.courseDescription}</p>
                  <p className="text-gray-600 text-sm">
                    {course.courseDuration} Hours
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => navigate(`/edit-course/${id}`)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Course
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center px-4 py-2 bg-red-400 text-white rounded-lg shadow hover:bg-red-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Course
              </button>
            </div>
            
            {/* Modules Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Modules
              </h2>
              {course.modules?.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-5 bg-gray-50"
                    >
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        Module {index + 1}: {module.title}
                      </h3>

                      {module.sections?.length > 0 && (
                        <div className="space-y-6">
                          {module.sections.map((section, sIdx) => (
                            <div
                              key={sIdx}
                              className="bg-white p-4 rounded-lg shadow-sm"
                            >
                              <div className="flex justify-between items-center mb-2">
  <h4 className="font-medium text-lg text-gray-800">
    Section {sIdx + 1}: {section.sectionName}
  </h4>
  <button
    onClick={() => toggleSectionVisibility(index, sIdx)}
    className="text-sm text-blue-600 hover:underline"
  >
    {visibleSections[`${index}-${sIdx}`] ? 'Hide' : 'Show'}
  </button>
</div>
{visibleSections[`${index}-${sIdx}`] && (
  <>
                              {/* Learning Materials Table */}
                              <div className="mb-6">
                                <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2 text-blue-600"
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
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Content
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {section.learningMaterialNotes && (
                                        <tr>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Notes
                                          </td>
                                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {section.learningMaterialNotes
                                              .length > 100
                                              ? `${section.learningMaterialNotes.substring(
                                                  0,
                                                  100
                                                )}...`
                                              : section.learningMaterialNotes}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                              onClick={() =>
                                                openContentModal(
                                                  `${section.sectionName} - Learning Material Notes`,
                                                  section.learningMaterialNotes
                                                )
                                              }
                                              className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                              View
                                            </button>
                                            <button
                                              onClick={() =>
                                                downloadAsPDF(
                                                  `${section.sectionName} - Learning Material Notes`,
                                                  section.learningMaterialNotes
                                                )
                                              }
                                              className="text-green-600 hover:text-green-800"
                                            >
                                              Download
                                            </button>
                                          </td>
                                        </tr>
                                      )}
                                      {section.learningMaterialUrls?.map(
                                        (url, urlIdx) => (
                                          <tr key={`lm-${urlIdx}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                              Learning Material {urlIdx + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                              <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                              >
                                                File Type:{" "}
                                                {url
                                                  .split(".")
                                                  .pop()
                                                  .split(/\#|\?/)[0]
                                                  .toUpperCase()}{" "}
                                                file
                                              </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                              >
                                                View
                                              </a>

                                              <button
                                                onClick={() =>
                                                  handleBlobDownload(
                                                    url,
                                                    `file-${urlIdx + 1}`
                                                  )
                                                }
                                                className="text-green-600 hover:text-green-800"
                                              >
                                                Download
                                              </button>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Code Challenges Table */}
                              <div className="mb-6">
                                <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2 text-green-600"
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
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Content
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {section.codeChallengeInstructions && (
                                        <tr>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Instructions
                                          </td>
                                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {section.codeChallengeInstructions
                                              .length > 100
                                              ? `${section.codeChallengeInstructions.substring(
                                                  0,
                                                  100
                                                )}...`
                                              : section.codeChallengeInstructions}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                              onClick={() =>
                                                openContentModal(
                                                  `${section.sectionName} - Code Challenge Instructions`,
                                                  section.codeChallengeInstructions
                                                )
                                              }
                                              className="text-blue-600 hover:text-blue-800 mr-3"
                                            >
                                              View
                                            </button>
                                            <button
                                              onClick={() =>
                                                downloadAsPDF(
                                                  `${section.sectionName} - Code Challenge Instructions`,
                                                  section.codeChallengeInstructions
                                                )
                                              }
                                              className="text-green-600 hover:text-green-800"
                                            >
                                              Download
                                            </button>
                                          </td>
                                        </tr>
                                      )}
                                      {section.codeChallengeUrls?.map(
                                        (url, urlIdx) => (
                                          <tr key={`cc-${urlIdx}`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                              Code Challenge {urlIdx + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                              <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                              >
                                                File Type:{" "}
                                                {url
                                                  .split(".")
                                                  .pop()
                                                  .split(/\#|\?/)[0]
                                                  .toUpperCase()}{" "}
                                                file
                                              </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 mr-3"
                                              >
                                                View
                                              </a>
                                             <button
                                                onClick={() =>
                                                  handleBlobDownload(
                                                    url,
                                                    `file-${urlIdx + 1}`
                                                  )
                                                }
                                                className="text-green-600 hover:text-green-800"
                                              >
                                                Download
                                              </button>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Video References Table */}
                              {section.videoReferences?.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 mr-2 text-red-600"
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
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Video
                                          </th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Preview
                                          </th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {section.videoReferences.map(
                                          (url, urlIdx) => {
                                            const videoId = getYouTubeId(url);
                                            return (
                                              <tr key={`vr-${urlIdx}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                  Reference Video {urlIdx + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                  {videoId ? (
                                                    <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                                                      <iframe
                                                        className="absolute top-0 left-0 w-full h-full"
                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        title={`Video ${
                                                          urlIdx + 1
                                                        }`}
                                                      ></iframe>
                                                    </div>
                                                  ) : (
                                                    <span className="text-sm text-gray-500">
                                                      Invalid YouTube URL
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                  <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800"
                                                  >
                                                    Watch on YouTube
                                                  </a>
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                                </>
)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                  No modules available for this course
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Modal */}
      <Modal
        isOpen={showContentModal}
        onRequestClose={() => setShowContentModal(false)}
        contentLabel="Content Viewer"
        className="bg-white p-6 rounded-xl shadow-xl max-w-2xl mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {modalContent.title}
          </h2>
          <button
            onClick={() => setShowContentModal(false)}
            className="text-gray-500 hover:text-gray-700"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line overflow-auto max-h-[60vh]">
          {modalContent.content || (
            <span className="text-gray-500">No content available</span>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={() =>
              downloadAsPDF(modalContent.title, modalContent.content)
            }
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download PDF
          </button>
          <button
            onClick={() => setShowContentModal(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        contentLabel="Confirm Course Deletion"
        className="bg-white p-6 rounded-xl shadow-xl max-w-md mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-center"
      >
        {JSON.parse(localStorage.getItem("user"))?.role === "admin" ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Course</h2>

            <div className="mb-6">
              <p className="mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{course.courseName}"</span>?
              </p>
              {course.enrolledStudents?.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        Warning: This course has {course.enrolledStudents.length} enrolled students who will lose access.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete Course
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-red-600">Access Denied</h2>
            <p className="mb-6 text-sm text-gray-700">
              Only admin can delete a course. Please contact an administrator if you need to remove this course.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ViewCourse;