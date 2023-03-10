import { useEffect, useState } from 'react'; 
import { useLocation, Location } from 'react-router-dom';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LeftDrawer from './components/LeftDrawer';
import Relay from './components/Relay';

import Create from './Create';
import Award from './Award';
import Badges from './Badges';
import Test from './Test';

import { Route, Routes } from 'react-router-dom';
import { RelayContext } from './RelayContext';

const drawerWidth = 240;
type Title = {
  path: string;
  name: string;
}


export default function App() {
  const [relay, setRelay] = useState("ws://localhost:8008")

  const titleMap = new Map();
  titleMap.set("/", "Nostr Badger");
  titleMap.set("/badges", "Badge Explorer");
  titleMap.set("/create", "Publish Badge");
  titleMap.set("/award", "Award Badge");
  titleMap.set("/test", "Test");
  
  const location = useLocation();
  const [title, setTitle] = useState(titleMap.get("/"));

  // persist relay URLs even if App if refreshed
  useEffect(() => {
    const localRelay = window.localStorage.getItem('relay');
        if (localRelay)
        {
            setRelay(localRelay);
        }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('relay', relay)
  }, [relay]);

  useEffect(() => {
    setTitle(titleMap.get(location.pathname));
  }, [location.pathname]);


  return (
    <Box display='flex'>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
    <Box sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          }
        }}
      >
      <LeftDrawer />
    </Box>

      <Box component="main" display='flex' width={1} flexDirection='column' alignItems='center' sx={{ p: 2 }}>
      <Toolbar />
      <RelayContext.Provider value={{relay, setRelay}}>
        <Box display='flex' flexDirection='column' alignItems='left' width='800px' sx={{ }}>
          <Relay fullWidth></Relay>
          <Box mt={1}>
          <Routes>
              <Route path="create" element={<Create />} />
              <Route path="award" element={<Award />} />
              <Route path="badges" element={<Badges />} />
              <Route path="test" element={<Test />} />
          </Routes>
          </Box>
          </Box>
        </RelayContext.Provider>
        
      </Box>

    </Box>
  );
}
