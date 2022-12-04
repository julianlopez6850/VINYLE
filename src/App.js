import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react';

import Navbar from './Components/Navbar';
import Main from './pages/Main';
import Login from './pages/Login';
import Registration from './pages/Registration';

const App = () => {

  return (
    <ChakraProvider>
      <div className="App">
        <Router>
          <Navbar />
          <Routes>
            <Route exact path="/" element={<Main />} />
            <Route exact path="/registration" element={<Registration />} />
            <Route exact path="/login" element={<Login />} />
          </Routes>
        </Router>
      </div>
    </ChakraProvider>
  );
}

export default App;
