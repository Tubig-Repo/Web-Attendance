import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { db } from "../src/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchSections = async () => {
    const querySnapshot = await getDocs(collection(db, "sections"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSections(data);
  };

    const fetchStudents = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const data = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) => user.role === "student"); // Only students
    setStudents(data);
    setLoading(false);
    };


  useEffect(() => {
    fetchSections();
    fetchStudents();
  }, []);

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingId(student.id);
      setStudentName(student.name);
      setSelectedSection(student.section || "");
    } else {
      setEditingId(null);
      setStudentName("");
      setSelectedSection("");
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setStudentName("");
    setSelectedSection("");
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!studentName.trim() || !selectedSection) return;

    const studentData = {
      name: studentName,
      section: selectedSection,
      role: "student", // Mark this user as a student

    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "users", editingId), studentData);
      } else {
        await addDoc(collection(db, "users"), studentData);
      }

      await fetchStudents();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving student:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
      fetchStudents();
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Students</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
          Add Student
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
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.section || "—"}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenModal(student)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(student.id)}>
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
        <DialogTitle>{editingId ? "Edit Student" : "Add Student"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Student Name"
            fullWidth
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Section</InputLabel>
            <Select
              value={selectedSection}
              label="Section"
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {sections.map((section) => (
                <MenuItem key={section.id} value={section.name}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
