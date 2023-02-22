import React, { useState } from 'react';
import './App.css';
import { Navigate, BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider, Text } from '@chakra-ui/react';
import { profileContext } from './helpers/profileContext';

import Navbar from './components/Navbar';
import Classic from './pages/Classic';
import Infinite from './pages/Infinite';
import Login from './pages/Login';
import Registration from './pages/Registration';
import History from './pages/History'

const App = () => {

  const [profile, setProfile] = useState({ loggedIn: false, username: undefined, settings: { darkTheme: true, colorblindMode: false, difficulty: 0 } });

  return (
    <ChakraProvider>
      <div className="App">
        <profileContext.Provider value = {{ profile, setProfile }}>
        <Router>
          <Navbar />
          <Routes>
            <Route exact path="/" element={ <Navigate to="/classic" /> } />
            <Route exact path="/classic" element={<Classic/>} />
            <Route exact path="/inf" element={ <Navigate to="/infinite" /> } />
            <Route exact path="/infinite" element={<Infinite/>} />
            <Route exact path="/shared/*" element={<Infinite/>} />
            <Route exact path="/register" element={<Registration />} />
            <Route exact path="/registration" element={ <Navigate to="/register" /> } />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/history" element={ <Navigate to="/history/all" /> } />
            {["/history/all", "/history/classic", "/history/infinite"].map((path, index) => 
              <Route path={path} element={<History />} key={index} />
            )}
          </Routes>
        </Router></profileContext.Provider>
        <Text color="gray.300" position="absolute" bottom="10px">
          playvinyle.com – 2023
        </Text>
      </div>
    </ChakraProvider>
  );
}

export default App;
