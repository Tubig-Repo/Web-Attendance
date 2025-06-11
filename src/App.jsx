import {Routes, Route } from "react-router";
import Login from '../pages/Login'
import Section from "../components/attendance/Section";
import MainPage from "../pages/MainPage";

function App() {

  return (
      <Routes>
        <Route path="/" element={<Login/> }/>
        <Route path="/section" element={<Section />} />
        <Route path="/main" element={<MainPage/> }/>
      </Routes>
  )
}

export default App
