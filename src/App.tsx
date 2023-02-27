import * as React from 'react';
import Container from '@mui/material/Container';
import ResponsiveAppBar from './components/ResponsiveAppBar';
import Create from './components/Create';
import Issue from './components/Issue';
import { Route, Routes } from 'react-router-dom';

export default function App() {
  return (
    <Container maxWidth="md">
      <ResponsiveAppBar />
      <Routes>
        <Route path="Create" element={<Create />} />
        <Route path="Issue" element={<Issue />} />
      </Routes>
    </Container>
  );
}
