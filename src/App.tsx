import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainMenu from "./components/MainMenu";
import TaskList from "./components/TaskList";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
