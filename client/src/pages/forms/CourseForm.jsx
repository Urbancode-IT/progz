import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../../api/api"; // Adjust the import based on your project structure
import { useNavigate } from "react-router-dom";

const CourseForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [isSectionOpen, setIsSectionOpen] = useState(true);
  const [openSections, setOpenSections] = useState({});

  const toggleSectionOpen = (moduleIndex, sectionIndex) => {
  const key = `${moduleIndex}-${sectionIndex}`;
  setOpenSections(prev => ({
    ...prev,
    [key]: !prev[key]
  }));
};

  // Fetch instructors on component mount
  React.useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await API.get(
          "/users/role/instructor",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setInstructors(response.data);
      } catch (err) {
        console.error("Failed to fetch instructors:", err);
      }
    };
    fetchInstructors();
  }, []);
  const generateCourseId = () => {
  return `CRS-${Math.floor(1000 + Math.random() * 9000)}`;
};

  const validationSchema = Yup.object().shape({
    courseName: Yup.string().required("Course name is required"),
    courseId: Yup.string()
      .required("Course ID is required")
      .matches(
        /^[a-zA-Z0-9_-]+$/,
        "Only letters, numbers, hyphens and underscores allowed"
      ),
    courseDescription: Yup.string().required("Course description is required"),
    courseDuration: Yup.number()
      .required("Course duration is required"),
    modules: Yup.array()
      .of(
        Yup.object().shape({
          title: Yup.string().required("Module title is required"),
          sections: Yup.array()
            .of(
              Yup.object().shape({
                sectionName: Yup.string().required("Section name is required"),
                learningMaterialNotes: Yup.string().required("Learning material notes are required"),
                codeChallengeInstructions: Yup.string().required("Code challenge instructions are required"),
              })
            )
            .min(1, "Each module must have at least one section"),
        })
      )
      .min(1, "Course must have at least one module"),
  });

  const formik = useFormik({
    initialValues: {
      courseName: "",
      courseId: "",
      courseDescription: "",
      courseDuration: "",
      instructor: [],
      modules: [
        {
          title: "",
          sections: [
            {
              sectionName: "",
              learningMaterialNotes: "",
              learningMaterialUrls: [],
              codeChallengeInstructions: "",
              codeChallengeUrls: [],
              videoReferences: []
            },
          ],
        },
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError("");
      try {
        const response = await API.post(
          "/courses",
          values,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log("Payload being submitted:", JSON.stringify(values, null, 2));
        navigate(-1, { state: { message: "Course created successfully" } });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to create course");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const addModule = () => {
    formik.setFieldValue("modules", [
      ...formik.values.modules,
      {
        title: "",
        sections: [
          {
            sectionName: "",
            learningMaterialNotes: "",
            learningMaterialUrls: [],
            codeChallengeInstructions: "",
            codeChallengeUrls: [],
            videoReferences: []
          },
        ],
      },
    ]);
  };

  const removeModule = (index) => {
    const modules = [...formik.values.modules];
    modules.splice(index, 1);
    formik.setFieldValue("modules", modules);
  };

  const addSection = (moduleIndex) => {
    const modules = [...formik.values.modules];
    modules[moduleIndex].sections.push({
      sectionName: "",
      learningMaterialNotes: "",
      learningMaterialUrls: [],
      codeChallengeInstructions: "",
      codeChallengeUrls: [],
      videoReferences: []
    });
    formik.setFieldValue("modules", modules);
  };

  const removeSection = (moduleIndex, sectionIndex) => {
    const modules = [...formik.values.modules];
    modules[moduleIndex].sections.splice(sectionIndex, 1);
    formik.setFieldValue("modules", modules);
  };

  const handleFileUpload = async (e, moduleIndex, sectionIndex, fieldName) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    const uploadedUrls = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 1024 * 1024) {
          alert("Each file must be less than 1MB.");
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await API.post(
          "/upload/file",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        uploadedUrls.push(res.data.fileUrl);
      }

      const newModules = [...formik.values.modules];
      const newSections = [...newModules[moduleIndex].sections];
      
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        [fieldName]: [...newSections[sectionIndex][fieldName], ...uploadedUrls]
      };

      newModules[moduleIndex] = {
        ...newModules[moduleIndex],
        sections: newSections,
      };

      formik.setFieldValue("modules", newModules);
    } catch (err) {
      alert("File upload failed.");
      console.error(err);
    }
  };

  const handleVideoReferenceAdd = (moduleIndex, sectionIndex, url) => {
    if (!url) return;
    
    const newModules = [...formik.values.modules];
    const newSections = [...newModules[moduleIndex].sections];
    
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      videoReferences: [...newSections[sectionIndex].videoReferences, url]
    };

    newModules[moduleIndex] = {
      ...newModules[moduleIndex],
      sections: newSections,
    };

    formik.setFieldValue("modules", newModules);
  };

  const removeUrl = (moduleIndex, sectionIndex, fieldName, urlIndex) => {
    const newModules = [...formik.values.modules];
    const newSections = [...newModules[moduleIndex].sections];
    
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      [fieldName]: newSections[sectionIndex][fieldName].filter((_, i) => i !== urlIndex)
    };

    newModules[moduleIndex] = {
      ...newModules[moduleIndex],
      sections: newSections,
    };

    formik.setFieldValue("modules", newModules);
  };
  useEffect(() => {
      formik.setFieldValue('courseId', generateCourseId());
    }, []);

  return (
    <div className="min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gray-800 px-6 py-4">
            <h2 className="text-2xl font-bold text-white font-serif">
              Create New Course
            </h2>
            <p className="text-gray-100 mt-1 font-light">
              Define your course structure with modules and sections
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                    Course Name *
                  </label>
                  <input
                    name="courseName"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.courseName}
                    className={`block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out
                      ${
                        formik.touched.courseName && formik.errors.courseName
                          ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500"
                      }
                      shadow-sm focus:outline-none`}
                  />
                  {formik.touched.courseName && formik.errors.courseName && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {formik.errors.courseName}
                    </p>
                  )}
                </div>

                {/* Course ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                    Course ID *
                  </label>
                  <input
                    name="courseId"
                    type="text"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.courseId}
                    className={`block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out
                      ${
                        formik.touched.courseId && formik.errors.courseId
                          ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500"
                      }
                      shadow-sm focus:outline-none`}
                  />
                  {formik.touched.courseId && formik.errors.courseId && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                      {formik.errors.courseId}
                    </p>
                  )}
                </div>
              </div>
              {/* Course Description */}
              <div >
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                  Course Description *
                </label>
                <textarea
                  name="courseDescription"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.courseDescription}
                  className={`block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out
                      ${
                        formik.touched.courseDescription && formik.errors.courseDescription
                          ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500"
                      }
                      shadow-sm focus:outline-none`}
                />
                {formik.touched.courseDescription && formik.errors.courseDescription && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {formik.errors.courseDescription}
                </p>)}
              </div>
              {/* Course Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                  Course Duration (in hours) *
                </label>
                <input
                  name="courseDuration"
                  type="number"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.courseDuration}
                  className={`block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out
                      ${
                        formik.touched.courseDuration && formik.errors.courseDuration
                          ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500"
                      }
                      shadow-sm focus:outline-none`}
                />
                {formik.touched.courseDuration && formik.errors.courseDuration && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {formik.errors.courseDuration}
                  </p>
                )}
                  </div>

              {/* Instructor */}
              <div>
          <label>Instructors *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {instructors.map((instructor) => (
              <label key={instructor._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="instructors"
                  value={instructor._id}
                  checked={formik.values.instructor.includes(instructor._id)}
                  onChange={(e) => {
                    const selected = formik.values.instructor;
                    const value = e.target.value;
                    const isChecked = e.target.checked;
                    formik.setFieldValue(
                      "instructor",
                      isChecked
                        ? [...selected, value]
                        : selected.filter((id) => id !== value)
                    );
                  }}
                />
                <span>{instructor.name} ( {instructor.email} )</span>
              </label>
            ))}
          </div>
          {formik.touched.instructor && formik.errors.instructor && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.instructor}</p>
          )}
        </div>

              {/* Modules Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 font-sans">
                    Modules
                  </h3>
                  <button
                    type="button"
                    onClick={addModule}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                    Add Module
                  </button>
                </div>

                {formik.values.modules.map((module, moduleIndex) => (
                  <div
                    key={moduleIndex}
                    className="border border-gray-200 rounded-lg p-5 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-800 font-sans">
                        Module {moduleIndex + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeModule(moduleIndex)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium font-sans"
                      >
                        Remove Module
                      </button>
                    </div>

                    {/* Module Title */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                        Module Title *
                      </label>
                      <input
                        name={`modules[${moduleIndex}].title`}
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={module.title}
                        className={`block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out
                          ${
                            formik.touched.modules?.[moduleIndex]?.title &&
                            formik.errors.modules?.[moduleIndex]?.title
                              ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                              : "border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500"
                          }
                          shadow-sm focus:outline-none`}
                      />
                      {formik.touched.modules?.[moduleIndex]?.title &&
                        formik.errors.modules?.[moduleIndex]?.title && (
                          <p className="mt-2 text-sm text-red-600 font-medium">
                            {formik.errors.modules[moduleIndex].title}
                          </p>
                        )}
                    </div>

                    {/* Sections */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-medium text-gray-700 font-sans">
                          Sections
                        </h5>
                        <button
                          type="button"
                          onClick={() => addSection(moduleIndex)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gray-800 hover:bg-gray-700  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                        >
                          Add Section
                        </button>
                      </div>

                      {module.sections.map((section, sectionIndex) => (
                        <div
                          key={sectionIndex}
                          className="border border-gray-200 rounded-lg p-4 bg-white"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700 font-sans">
                              Section {sectionIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                removeSection(moduleIndex, sectionIndex)
                              }
                              className="text-red-600 hover:text-red-800 text-xs font-medium font-sans"
                            >
                              Remove Section
                            </button>
                          </div>


                          <div className="border rounded-lg p-4 mb-4 bg-white shadow-sm">
  {/* Toggle Button */}
  <div
    onClick={() => toggleSectionOpen(moduleIndex, sectionIndex)}

    className="flex justify-between items-center cursor-pointer select-none"
  >
    <h3 className="text-md font-semibold text-gray-700 font-sans">
      Section {sectionIndex + 1}
    </h3>
    <span className="text-sm text-gray-600 hover:underline">
      {openSections[`${moduleIndex}-${sectionIndex}`] ? "Hide" : "Show"}
    </span>
  </div>
{openSections[`${moduleIndex}-${sectionIndex}`] && (
                          <div className="space-y-4">
                            {/* Section Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                                Section Name *
                              </label>
                              <input
                                name={`modules[${moduleIndex}].sections[${sectionIndex}].sectionName`}
                                type="text"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={section.sectionName}
                                className={`block w-full rounded-lg border px-4 py-2 font-sans text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out
                                  ${
                                    formik.touched.modules?.[moduleIndex]
                                      ?.sections?.[sectionIndex]?.sectionName &&
                                    formik.errors.modules?.[moduleIndex]
                                      ?.sections?.[sectionIndex]?.sectionName
                                      ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                                      : "border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500"
                                  }
                                  shadow-sm focus:outline-none`}
                              />
                              {formik.touched.modules?.[moduleIndex]
                                ?.sections?.[sectionIndex]?.sectionName &&
                                formik.errors.modules?.[moduleIndex]
                                  ?.sections?.[sectionIndex]?.sectionName && (
                                  <p className="mt-2 text-xs text-red-600 font-medium">
                                    {
                                      formik.errors.modules[moduleIndex]
                                        .sections[sectionIndex].sectionName
                                    }
                                  </p>
                                )}
                            </div>

                            {/* Learning Material */}
                            <div className="border-t pt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                                Learning Material Notes *
                              </label>
                              <textarea
                                name={`modules[${moduleIndex}].sections[${sectionIndex}].learningMaterialNotes`}
                                rows={3}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={section.learningMaterialNotes}
                                className={`block w-full rounded-lg border px-4 py-2 font-sans text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out
                                  ${
                                    formik.touched.modules?.[moduleIndex]
                                      ?.sections?.[sectionIndex]?.learningMaterialNotes &&
                                    formik.errors.modules?.[moduleIndex]
                                      ?.sections?.[sectionIndex]?.learningMaterialNotes
                                      ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                                      : "border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500"
                                  }
                                  shadow-sm focus:outline-none`}
                              />
                              {formik.touched.modules?.[moduleIndex]
                                ?.sections?.[sectionIndex]?.learningMaterialNotes &&
                                formik.errors.modules?.[moduleIndex]
                                  ?.sections?.[sectionIndex]?.learningMaterialNotes && (
                                  <p className="mt-2 text-xs text-red-600 font-medium">
                                    {
                                      formik.errors.modules[moduleIndex]
                                        .sections[sectionIndex].learningMaterialNotes
                                    }
                                  </p>
                                )}

                              <label className="block text-sm font-medium text-gray-700 mt-4 mb-2 font-sans">
                                Learning Material Files (Optional)
                              </label>
                              <input
                                type="file"
                                multiple
                                onChange={(e) => handleFileUpload(e, moduleIndex, sectionIndex, 'learningMaterialUrls')}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-lg file:border-0
                                  file:text-sm file:font-medium
                                  file:bg-gray-50 file:text-gray-700
                                  hover:file:bg-gray-100"
                              />
                              {section.learningMaterialUrls.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {section.learningMaterialUrls.map((url, urlIndex) => (
                                    <div key={urlIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                      <a 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline truncate"
                                      >
                                        File {urlIndex + 1}
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => removeUrl(moduleIndex, sectionIndex, 'learningMaterialUrls', urlIndex)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Code Challenge */}
                            <div className="border-t pt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                                Code Challenge Instructions *
                              </label>
                              <textarea
                                name={`modules[${moduleIndex}].sections[${sectionIndex}].codeChallengeInstructions`}
                                rows={3}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={section.codeChallengeInstructions}
                                className={`block w-full rounded-lg border px-4 py-2 font-sans text-gray-700 placeholder-gray-400 transition-all duration-200 ease-in-out
                                  ${
                                    formik.touched.modules?.[moduleIndex]
                                      ?.sections?.[sectionIndex]?.codeChallengeInstructions &&
                                    formik.errors.modules?.[moduleIndex]
                                      ?.sections?.[sectionIndex]?.codeChallengeInstructions
                                      ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                                      : "border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500"
                                  }
                                  shadow-sm focus:outline-none`}
                              />
                              {formik.touched.modules?.[moduleIndex]
                                ?.sections?.[sectionIndex]?.codeChallengeInstructions &&
                                formik.errors.modules?.[moduleIndex]
                                  ?.sections?.[sectionIndex]?.codeChallengeInstructions && (
                                  <p className="mt-2 text-xs text-red-600 font-medium">
                                    {
                                      formik.errors.modules[moduleIndex]
                                        .sections[sectionIndex].codeChallengeInstructions
                                    }
                                  </p>
                                )}

                              <label className="block text-sm font-medium text-gray-700 mt-4 mb-2 font-sans">
                                Code Challenge Files (Optional)
                              </label>
                              <input
                                type="file"
                                multiple
                                onChange={(e) => handleFileUpload(e, moduleIndex, sectionIndex, 'codeChallengeUrls')}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-lg file:border-0
                                  file:text-sm file:font-medium
                                  file:bg-gray-50 file:text-gray-700
                                  hover:file:bg-gray-100"
                              />
                              {section.codeChallengeUrls.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {section.codeChallengeUrls.map((url, urlIndex) => (
                                    <div key={urlIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                      <a 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline truncate"
                                      >
                                        File {urlIndex + 1}
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => removeUrl(moduleIndex, sectionIndex, 'codeChallengeUrls', urlIndex)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Video References */}
                            <div className="border-t pt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                                Video References (Optional)
                              </label>
                              <div className="flex">
                                <input
                                  type="text"
                                  placeholder="Enter YouTube URL"
                                  id={`videoRef-${moduleIndex}-${sectionIndex}`}
                                  className="flex-1 rounded-l-lg border px-4 py-2 font-sans text-gray-700 placeholder-gray-400 border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`videoRef-${moduleIndex}-${sectionIndex}`);
                                    handleVideoReferenceAdd(moduleIndex, sectionIndex, input.value);
                                    input.value = '';
                                  }}
                                  className="px-4 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                  Add
                                </button>
                              </div>
                              {section.videoReferences.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {section.videoReferences.map((url, urlIndex) => (
                                    <div key={urlIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                      <a 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline truncate"
                                      >
                                        Video {urlIndex + 1}
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => removeUrl(moduleIndex, sectionIndex, 'videoReferences', urlIndex)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>)}
</div>



                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-70 transition-all duration-200 font-sans"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                      Creating Course...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;