import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";
import CanvasEditor from "./components/CanvasEditor";
import { v4 as uuidv4 } from "uuid";

function RedirectToCanvas() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const newId = uuidv4();
    navigate(`/canvas/${newId}`);
  }, [navigate]);
  return null;
}

function CanvasRoute() {
  const { id } = useParams();
  return <CanvasEditor sceneId={id} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RedirectToCanvas />} />
        <Route path="/canvas/:id" element={<CanvasRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
