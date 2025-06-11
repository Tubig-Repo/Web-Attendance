import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { db } from "../src/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const [teacherName, setTeacherName] = useState("");
  const [selectedSections, setSelectedSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch sections
  const fetchSections = async () => {
    const snapshot = await getDocs(collection(db, "sections"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSections(data);
  };

  // Fetch teachers from users
  const fetchTeachers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((user) => user.role === "teacher");
    setTeachers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
    fetchTeachers();
  }, []);

  const handleOpenModal = (teacher = null) => {
    if (teacher) {
      setEditingId(teacher.id);
      setTeacherName(teacher.name);
      setSelectedSection(teacher.section || "");
      setSelectedSections(teacher.sections || []); // ✅ for multiple sections

    } else {
      setEditingId(null);
      setTeacherName("");
      setSelectedSections([]);
      setSubjects([]);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTeacherName("");
    setSelectedSection([]);
    setSubjects([]);
    setSubjectInput("");
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!teacherName.trim() || !selectedSections || subjects.length === 0)
      return;

    const teacherData = {
      name: teacherName,
      section: selectedSections,
      subjects,
      role: "teacher",
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "users", editingId), teacherData);
      } else {
        await addDoc(collection(db, "users"), teacherData);
      }

      await fetchTeachers();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving teacher:", err);
    }

  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      fetchTeachers();
    } catch (err) {
      console.error("Error deleting teacher:", err);
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Teachers</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Add Teacher
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Subjects</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.section || "—"}</TableCell>
                  <TableCell>
                    {teacher.subjects?.length
                      ? teacher.subjects.join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenModal(teacher)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(teacher.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>{editingId ? "Edit Teacher" : "Add Teacher"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Teacher Name"
            fullWidth
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Sections</InputLabel>
            <Select
              multiple
              value={selectedSections}
              onChange={(e) => setSelectedSections(e.target.value)}
              renderValue={(selected) => selected.join(", ")}
            >
              {sections.map((section) => (
                <MenuItem key={section.id} value={section.name}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Add Subject"
            fullWidth
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Button
            onClick={() => {
              const trimmed = subjectInput.trim();
              if (trimmed && !subjects.includes(trimmed)) {
                setSubjects((prev) => [...prev, trimmed]);
                setSubjectInput("");
              }
            }}
            sx={{ mt: 1 }}
            variant="outlined"
          >
            Add Subject
          </Button>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {subjects.map((subj, index) => (
              <Button
                key={index}
                size="small"
                variant="contained"
                color="secondary"
                onClick={() =>
                  setSubjects(subjects.filter((_, i) => i !== index))
                }
              >
                {subj} ✕
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
