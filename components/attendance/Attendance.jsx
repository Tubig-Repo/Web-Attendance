import { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Checkbox, Typography, MenuItem, Select, FormControl, InputLabel, Button, TextField
} from '@mui/material';
import { db } from '../../src/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export default function Attendance() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sections, setSections] = useState([]);
  const [section, setSection] = useState('');
  const [date, setDate] = useState('');
  const [rows, setRows] = useState([]);

  const fetchTeachers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const teacherList = querySnapshot.docs
      .filter(doc => doc.data().role === "teacher")
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    setTeachers(teacherList);
  };

  const fetchSections = async () => {
    const querySnapshot = await getDocs(collection(db, "sections"));
    const sectionList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSections(sectionList);
  };

  const fetchStudentsWithAttendance = async () => {
    if (!section || !date) return;

    const usersSnapshot = await getDocs(collection(db, "users"));
    const students = [];

    usersSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.role === "student" && data.section === section) {
        students.push({ id: docSnap.id, name: data.name, present: false });
      }
    });

    const docId = `date-${date}_${section}`;
    const attendanceDoc = await getDoc(doc(db, "attendance", docId));

    if (attendanceDoc.exists()) {
      const attendanceData = attendanceDoc.data();
      const updatedStudents = students.map((student) => ({
        ...student,
        present: attendanceData.records?.[student.id]?.present || false,
      }));
      setRows(updatedStudents);
    } else {
      setRows(students);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSections();
  }, []);

  useEffect(() => {
    if (section && date) {
      fetchStudentsWithAttendance();
    }
  }, [section, date]);

  useEffect(() => {
    // Update subjects when teacher changes
    const teacher = teachers.find(t => t.id === selectedTeacher);
    setSubjects(teacher?.subjects || []);
    setSelectedSubject('');
  }, [selectedTeacher]);

  const handleCheck = (id) => {
    setRows(prev =>
      prev.map(row =>
        row.id === id ? { ...row, present: !row.present } : row
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!section || !date || !selectedTeacher || !selectedSubject) {
      alert("Please complete all fields.");
      return;
    }

    const docId = `date-${date}_${section}`;
    const attendanceRef = doc(db, "attendance", docId);

    const records = {};
    rows.forEach(row => {
      records[row.id] = { present: row.present };
    });

    await setDoc(attendanceRef, {
      date,
      section,
      subject: selectedSubject,
      records,
      teacherId: selectedTeacher,
    });

    alert("Attendance saved successfully!");
  };

  return (
    <>
      {/* Teacher Select */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="teacher-label">Teacher</InputLabel>
        <Select
          labelId="teacher-label"
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          label="Teacher"
        >
          {teachers.map((teacher) => (
            <MenuItem key={teacher.id} value={teacher.id}>{teacher.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Subject Select */}
      <FormControl fullWidth margin="normal" disabled={!selectedTeacher}>
        <InputLabel id="subject-label">Subject</InputLabel>
        <Select
          labelId="subject-label"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          label="Subject"
        >
          {subjects.map((subject, index) => (
            <MenuItem key={index} value={subject}>{subject}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Section Select */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="section-label">Section</InputLabel>
        <Select
          labelId="section-label"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          label="Section"
        >
          {sections.map((sec) => (
            <MenuItem key={sec.id} value={sec.name}>{sec.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date Picker */}
      <TextField
        fullWidth
        margin="normal"
        type="date"
        label="Select Date"
        InputLabelProps={{ shrink: true }}
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Attendance Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="center">Attendance</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={row.present}
                    onChange={() => handleCheck(row.id)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography color={row.present ? "green" : "error"}>
                    {row.present ? "Present" : "Absent"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleSaveAttendance}
        disabled={!section || !date || rows.length === 0 || !selectedSubject || !selectedTeacher}
      >
        Save Attendance
      </Button>
    </>
  );
}
