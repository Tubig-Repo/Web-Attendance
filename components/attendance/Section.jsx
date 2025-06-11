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
  CircularProgress,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { db } from "../../src/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import CreateSectionModal from "../common/CreateSectionModal"; 

export default function SectionsPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const fetchSections = async () => {
    const querySnapshot = await getDocs(collection(db, "sections"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSections(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleSaveSection = async (name) => {
    try {
      if (editingSection) {
        await updateDoc(doc(db, "sections", editingSection.id), { name });
      } else {
        await addDoc(collection(db, "sections"), { name });
      }
      fetchSections();
      setModalOpen(false);
      setEditingSection(null);
    } catch (error) {
      console.error("Error saving section:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "sections", id));
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Sections</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingSection(null);
            setModalOpen(true);
          }}
        >
          Add Section
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
                <TableCell>Section Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell>{section.name}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        setEditingSection(section);
                        setModalOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(section.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateSectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSection}
        initialData={editingSection}
      />
    </Box>
  );
}
