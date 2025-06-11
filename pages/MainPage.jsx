import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox
} from "@mui/material";
import { useState } from "react";
import { Book , Group, School} from "@mui/icons-material";
import SchoolIcon from '@mui/icons-material/School';
import Attendance from "../components/attendance/Attendance";
import Section from "../components/attendance/Section";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import Teachers from "./Teachers";
import Students from "./Students";
const drawerWidth = 240;

export default function MainPage() {
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  const renderContent = () => {
    switch (selectedTab) {
      case "Attendance":
        return <Attendance />;
      case "Sections":
        return <Section />;
      case "Students": 
        return <Students />;
      case "Teachers": 
        return <Teachers />;
      default:
        return <Typography variant="h4">Welcome!</Typography>;
    }
  };
  return (
    <Box sx={{ display: "flex"}}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            Attendance System
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List>
          {[
            { text: "Attendance", icon: <Book /> },
            { text: "Sections", icon: <Group /> },
            { text: "Students", icon: <SchoolIcon /> },
            {text: "Teachers", icon: <CreateOutlinedIcon />}
          ].map(({ text, icon }) => (
            <ListItem disablePadding key={text}>
              <ListItemButton onClick={() => setSelectedTab(text)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}
