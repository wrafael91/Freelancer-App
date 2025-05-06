import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Navbar from './components/Navbar';
import CssBaseline from '@mui/material/CssBaseline';

import Chat from './components/Chat';
import Login from './components/Login';
import Register from './components/Register';
import ServiceList from './components/ServiceList';
import ServiceForm from './components/ServiceForm';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={
            <PrivateRoute>
              <ServiceList />
            </PrivateRoute>
          } />
          <Route path="/services/new" element={
            <PrivateRoute>
              <ServiceForm />
            </PrivateRoute>
          } />
          <Route path="/services/edit/:id" element={
            <PrivateRoute>
              <ServiceForm />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;