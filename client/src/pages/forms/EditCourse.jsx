import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/api';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const generateCourseId = () => `CRS-${Math.floor(1000 + Math.random() * 9000)}`;


  const [form, setForm] = useState({
    courseName: '',
    courseId: '',
    courseDescription: '',
    courseDuration: 0,
    modules: [
      { 
        title: '', 
        sections: [{ 
          sectionName: '', 
          learningMaterialNotes: '', 
          learningMaterialUrls: [], 
          codeChallengeInstructions: '', 
          codeChallengeUrls: [], 
          videoReferences: [] 
        }] 
      }
    ]
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sectionVisibility, setSectionVisibility] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await API.get(`/courses/${id}`);
        setForm(res.data);
      } catch (error) {
        setError('Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const saveAsNewCourse = async () => {
  setIsLoading(true);
  setError('');

  try {
    const token = localStorage.getItem('token');
    const newPayload = {
      ...form,
      courseId: generateCourseId(), // Assign a new courseId
    };
    delete newPayload._id;
    delete newPayload.enrolledStudents;

    await API.post('/courses', newPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    navigate(-1, { state: { message: 'Course duplicated successfully' } });
  } catch (error) {
    setError(error.response?.data?.message || 'Failed to save new course');
  } finally {
    setIsLoading(false);
  }
};

  const handleModuleChange = (index, field, value) => {
    const updated = [...form.modules];
    updated[index][field] = value;
    setForm({ ...form, modules: updated });
  };
  

  const handleSectionChange = (mIdx, sIdx, field, value) => {
    const updated = [...form.modules];
    updated[mIdx].sections[sIdx][field] = value;
    setForm({ ...form, modules: updated });
  };

  const handleFileUpload = async (mIdx, sIdx, field, files) => {
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

        const res = await API.post("/upload/file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        uploadedUrls.push(res.data.fileUrl);
      }

      const updated = [...form.modules];
      updated[mIdx].sections[sIdx][field] = [
        ...updated[mIdx].sections[sIdx][field],
        ...uploadedUrls
      ];
      setForm({ ...form, modules: updated });
    } catch (err) {
      alert("File upload failed.");
      console.error(err);
    }
  };

  const handleVideoReferenceAdd = (mIdx, sIdx, url) => {
    if (!url) return;
    
    const updated = [...form.modules];
    updated[mIdx].sections[sIdx].videoReferences = [
      ...updated[mIdx].sections[sIdx].videoReferences,
      url
    ];
    setForm({ ...form, modules: updated });
  };

  const removeUrl = (mIdx, sIdx, field, urlIndex) => {
    const updated = [...form.modules];
    updated[mIdx].sections[sIdx][field] = updated[mIdx].sections[sIdx][field].filter(
      (_, i) => i !== urlIndex
    );
    setForm({ ...form, modules: updated });
  };

  const addModule = () => {
    setForm({
      ...form,
      modules: [
        ...form.modules, 
        { 
          title: '', 
          sections: [{ 
            sectionName: '', 
            learningMaterialNotes: '', 
            learningMaterialUrls: [], 
            codeChallengeInstructions: '', 
            codeChallengeUrls: [], 
            videoReferences: [] 
          }] 
        }
      ]
    });
  };

  const deleteModule = (idx) => {
    if (!window.confirm('Delete this module?')) return;
    setForm({ ...form, modules: form.modules.filter((_, i) => i !== idx) });
  };

  const addSection = (modIdx) => {
    const updated = [...form.modules];
    updated[modIdx].sections.push({ 
      sectionName: '', 
      learningMaterialNotes: '', 
      learningMaterialUrls: [], 
      codeChallengeInstructions: '', 
      codeChallengeUrls: [], 
      videoReferences: [] 
    });
    setForm({ ...form, modules: updated });
  };

  const deleteSection = (mIdx, sIdx) => {
    if (!window.confirm('Delete this section?')) return;
    const updated = [...form.modules];
    updated[mIdx].sections = updated[mIdx].sections.filter((_, i) => i !== sIdx);
    setForm({ ...form, modules: updated });
  };
  const moveSectionUp = (mIdx, sIdx) => {
  if (sIdx === 0) return;
  const updated = [...form.modules];
  const sections = updated[mIdx].sections;
  [sections[sIdx - 1], sections[sIdx]] = [sections[sIdx], sections[sIdx - 1]];
  setForm({ ...form, modules: updated });
};

const moveSectionDown = (mIdx, sIdx) => {
  const updated = [...form.modules];
  const sections = updated[mIdx].sections;
  if (sIdx === sections.length - 1) return;
  [sections[sIdx], sections[sIdx + 1]] = [sections[sIdx + 1], sections[sIdx]];
  setForm({ ...form, modules: updated });
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const updatePayload = {
        courseName: form.courseName,
        courseId: form.courseId,
        courseDescription: form.courseDescription,
        courseDuration: form.courseDuration,
        modules: form.modules
      };

      await API.put(`/courses/${id}`, updatePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      navigate(-1);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update course');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSectionVisibility = (mIdx, sIdx) => {
  const key = `${mIdx}-${sIdx}`;
  setSectionVisibility(prev => ({
    ...prev,
    [key]: !prev[key]
  }));
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center bg-gradient-to-br from-gray-200 to-gray-400 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-600 to-gray-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
            <h2 className="text-2xl font-bold text-white font-serif">Edit Course</h2>
            <p className="text-gray-100 mt-1 font-light">Update your course content and structure</p>
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
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">Course Name *</label>
                  <input
                    type="text"
                    value={form.courseName}
                    onChange={e => setForm({ ...form, courseName: e.target.value })}
                    className="block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">Course ID *</label>
                  <input
                    type="text"
                    value={form.courseId}
                    onChange={e => setForm({ ...form, courseId: e.target.value })}
                    className="block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm"
                  />
                </div>
                
              </div>
              <div >
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">Course Description</label>
                  <textarea
                    value={form.courseDescription}
                    onChange={e => setForm({ ...form, courseDescription: e.target.value })}
                    className="block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm"
                    rows={3}
                  />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">Course Duration (in Hours) *</label>
                  <input
                    type="text"
                    value={form.courseDuration}
                    onChange={e => setForm({ ...form, courseDuration: e.target.value })}
                    className="block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm"
                  />
                </div>

              {/* Modules */}
              {form.modules.map((mod, mIdx) => (
                <div key={mIdx} className="border border-gray-200 rounded-lg p-5 bg-gray-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={e => handleModuleChange(mIdx, 'title', e.target.value)}
                      className="block w-full rounded-lg border px-4 py-3 font-sans text-gray-700 text-xl font-semibold border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm"
                      placeholder='Module Title'
                    />
                    <button
                      type="button"
                      onClick={() => deleteModule(mIdx)}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove Module
                    </button>
                  </div>

                  {mod.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={sec.sectionName}
                          onChange={e => handleSectionChange(mIdx, sIdx, 'sectionName', e.target.value)}
                          className="block w-full rounded-lg border px-4 py-2 font-sans text-gray-700 border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => deleteSection(mIdx, sIdx)}
                          className="ml-4 text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Remove Section
                        </button>
                      </div>
                      <div className="flex gap-2 text-xs text-gray-600">
  <button 
    type="button" 
    onClick={() => moveSectionUp(mIdx, sIdx)}
    className="hover:underline text-blue-600"
  >
    ↑ Move Up
  </button>
  <button 
    type="button" 
    onClick={() => moveSectionDown(mIdx, sIdx)}
    className="hover:underline text-blue-600"
  >
    ↓ Move Down
  </button>

  
</div>
<div className="flex justify-between items-center mb-2">
  <h4 className="text-sm font-medium text-gray-700">Section {sIdx + 1}</h4>
  <button
    type="button"
    onClick={() => toggleSectionVisibility(mIdx, sIdx)}
    className="text-xs text-blue-600 hover:underline"
  >
    {sectionVisibility[`${mIdx}-${sIdx}`] ? 'Hide Details' : 'Show Details'}
  </button>
</div>
{sectionVisibility[`${mIdx}-${sIdx}`] && (
  <>
                      {/* Learning Material */}
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Learning Material</h3>
                        <textarea
                          placeholder="Notes"
                          value={sec.learningMaterialNotes}
                          onChange={e => handleSectionChange(mIdx, sIdx, 'learningMaterialNotes', e.target.value)}
                          className="w-full border rounded-lg px-4 py-2 font-sans text-gray-700 border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm"
                          rows={3}
                        />
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Files</label>
                          <input
                            type="file"
                            multiple
                            onChange={e => handleFileUpload(mIdx, sIdx, 'learningMaterialUrls', e.target.files)}
                            className="block w-full text-sm text-gray-600 rounded-lg border border-gray-300 px-4 py-2"
                          />
                          {sec.learningMaterialUrls?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {sec.learningMaterialUrls.map((url, urlIdx) => (
                                <div key={urlIdx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-600 hover:underline truncate"
                                  >
                                    File {urlIdx + 1}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => removeUrl(mIdx, sIdx, 'learningMaterialUrls', urlIdx)}
                                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                                  >
                                    Remove File
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Code Challenge */}
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Code Challenge</h3>
                        <textarea
                          placeholder="Instructions"
                          value={sec.codeChallengeInstructions}
                          onChange={e => handleSectionChange(mIdx, sIdx, 'codeChallengeInstructions', e.target.value)}
                          className="w-full border rounded-lg px-4 py-2 font-sans text-gray-700 border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm"
                          rows={3}
                        />
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Challenge Files</label>
                          <input
                            type="file"
                            multiple
                            onChange={e => handleFileUpload(mIdx, sIdx, 'codeChallengeUrls', e.target.files)}
                            className="block w-full text-sm text-gray-600 rounded-lg border border-gray-300 px-4 py-2"
                          />
                          {sec.codeChallengeUrls?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {sec.codeChallengeUrls.map((url, urlIdx) => (
                                <div key={urlIdx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-600 hover:underline truncate"
                                  >
                                    Challenge {urlIdx + 1}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => removeUrl(mIdx, sIdx, 'codeChallengeUrls', urlIdx)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Video References */}
                      <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Video References</h3>
                        <div className="flex">
                          <input
                            type="text"
                            placeholder="Enter YouTube URL"
                            id={`videoRef-${mIdx}-${sIdx}`}
                            className="flex-1 rounded-l-lg border px-4 py-2 font-sans text-gray-700 placeholder-gray-400 border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-500 shadow-sm focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(`videoRef-${mIdx}-${sIdx}`);
                              handleVideoReferenceAdd(mIdx, sIdx, input.value);
                              input.value = '';
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Add
                          </button>
                        </div>
                        {sec.videoReferences?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {sec.videoReferences.map((url, urlIdx) => (
                              <div key={urlIdx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                <a 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-600 hover:underline truncate"
                                >
                                  Video {urlIdx + 1}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => removeUrl(mIdx, sIdx, 'videoReferences', urlIdx)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                        </>
)}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSection(mIdx)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-gray-500 to-gray-500 hover:from-gray-600 hover:to-gray-600"
                  >
                    + Add Section
                  </button>
                </div>
              ))}

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-700 hover:to-gray-700"
                >
                  + Add Module
                </button>
                <div className="space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-700 hover:to-gray-700 disabled:opacity-70"
                  >
                    {isLoading ? 'Updating...' : 'Update Course'}
                  </button>
                  <button
    type="button"
    onClick={saveAsNewCourse}
    disabled={isLoading}
    className="px-5 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-green-800 hover:bg-green-700 disabled:opacity-70"
  >
    {isLoading ? 'Saving...' : 'Save As New Course'}
  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;