import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api/api";
import logo from "../../assets/icon.png";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  CircularProgress,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  CardHeader,
  Avatar
} from "@mui/material";
import {
  People as PeopleIcon,
  Book as BookIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";

const ViewBatch = () => {
  const { batchId } = useParams();
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionStatus, setSectionStatus] = useState({});
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const courseId = batchData?.course?._id;
  const navigate = useNavigate();
useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        setError(null);
        const res = await API.get(`/progress/batch/view/${batchId}`);
        const batch = res.data;
        setBatchData(batch);

        const sectionStatusMap = {};
        const token = localStorage.getItem("token");

        // Create a flat section list with module/section indexes
        const sectionList = [];
        batch.course.modules.forEach((mod, modIndex) => {
          mod.sections.forEach((sec, sectionIndex) => {
            sectionList.push({
              sectionId: sec._id,
              moduleIndex: modIndex,
              sectionIndex
            });
          });
        });

        // For each section, check all students' progress
        for (const section of sectionList) {
          let allCompleted = true;

          for (const student of batch.students) {
            const progressRes = await API.get(
              `/progress/${student._id}/${batch.course._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            const sectionProgress = progressRes.data.modules?.[section.moduleIndex]?.sections?.[section.sectionIndex];
            if (!sectionProgress?.isCompleted) {
              allCompleted = false;
              break;
            }
          }

          sectionStatusMap[section.sectionId] = allCompleted;
        }

        setSectionStatus(sectionStatusMap);
      } catch (err) {
        console.error("Error loading batch or section progress:", err);
        setError("Failed to load batch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [batchId]);
  const handleCheckboxChange = async (sectionId, checked, moduleIndex, sectionIndex) => {
    if (!batchData?.students || !courseId) return;

    setSectionStatus((prev) => ({
      ...prev,
      [sectionId]: checked,
    }));

    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      for (const student of batchData.students) {
        await API.put(
          `/progress/${student._id}/${courseId}`,
          {
            moduleIndex,
            sectionIndex,
            isCompleted: checked
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
    } catch (err) {
      console.error("Error updating section for all students:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!batchData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">No batch data found</Typography>
      </Box>
    );
  }

  return (
    <div className=" min-h-screen bg-[url('/Login.jpg')] bg-cover bg-center bg-gray-100">
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
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <PeopleIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          {batchData.name.toUpperCase()}
        </Typography>
        <Chip 
          label={`Course: ${batchData?.course?.courseName || 'N/A'}`} 
          color="primary"  
          sx={{ mb: 2 }} 
        />
        <Chip 
          label={`${batchData.students.length} Students`} 
          color="secondary" 
          sx={{ mb: 2, ml: 1 }} 
        />
      </Box>

      {/* Student Table */}
      <Card sx={{ borderRadius: '16px',marginBottom:'20px'}}>
        <CardHeader
          title="Students"
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PeopleIcon />
            </Avatar>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>#</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batchData.students.map((student, index) => (
                  <TableRow key={student._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/student-progress-ipov/${student._id}/${courseId}`}
                        
                        size="small"
                        startIcon={<VisibilityIcon />}
                      >
                        View Progress
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Course Sections */} 
      <Card sx={{borderRadius: '16px'}}>
        <CardHeader
          title="Course Sections"
          subheader="Mark sections as completed for all students"
          avatar={
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              <BookIcon />
            </Avatar>
          }
          action={
            updating && (
              <Box display="flex" alignItems="center">
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Updating...
                </Typography>
              </Box>
            )
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>Module</TableCell>
                  <TableCell>Section Name</TableCell>
                  <TableCell align="center">Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batchData.course.modules?.flatMap((mod, modIndex) =>
                  mod.sections.map((sec, secIndex) => (
                    <TableRow key={sec._id}>
                      <TableCell>
                        <Typography fontWeight="medium">
                          Module {modIndex + 1}: {mod.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{sec.sectionName}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={sectionStatus[sec._id] || false}
                          onChange={(e) =>
                            handleCheckboxChange(sec._id, e.target.checked, modIndex, secIndex)
                          }
                          disabled={updating}
                          color="primary"
                          icon={<CheckCircleIcon />}
                          checkedIcon={<CheckCircleIcon color="success" />}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
    </div>
  );
};

export default ViewBatch;