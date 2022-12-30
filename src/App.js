import './App.css';
import { Navigate, BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react';

import Navbar from './Components/Navbar';
import Classic from './pages/Classic';
import Infinite from './pages/Infinite';
import Login from './pages/Login';
import Registration from './pages/Registration';
import History from './pages/History'

const App = () => {

  return (
    <ChakraProvider>
      <div className="App">
        <Router>
          <Navbar />
          <Routes>
            <Route exact path="/" element={ <Navigate to="/classic" /> } />
            <Route exact path="/classic" element={<Classic/>} />
            <Route exact path="/infinite" element={<Infinite/>} />
            <Route exact path="/registration" element={<Registration />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/history" element={ <Navigate to="/history/all" /> } />
            {["/history/all", "/history/classic", "/history/infinite"].map((path, index) => 
              <Route path={path} element={<History />} key={index} />
            )}
          </Routes>
        </Router>
      </div>
    </ChakraProvider>
  );
}

export default App;
