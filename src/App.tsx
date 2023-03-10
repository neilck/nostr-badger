import { useEffect, useState } from 'react'; 
import { useLocation, Location } from 'react-router-dom';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LeftDrawer from './components/LeftDrawer';
import Create from './Create';
import Issue from './Issue';
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
  const [relays, setRelays] = useState(["ws://localhost:8008"])

  const titleMap = new Map();
  titleMap.set("/", "Nostr Badger");
  titleMap.set("/badges", "Badge Explorer");
  titleMap.set("/create", "Publish Badge");
  titleMap.set("/issue", "Issue Badge");
  titleMap.set("/test", "Test");
  
  const location = useLocation();
  const [title, setTitle] = useState(titleMap.get("/"));

  // persist relay URLs even if App if refreshed
  useEffect(() => {
    const localRelays = window.localStorage.getItem('relays');
        if (localRelays)
        {
            setRelays(JSON.parse(localRelays));
        }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('relays', JSON.stringify(relays));
  }, [relays]);

  useEffect(() => {
    setTitle(titleMap.get(location.pathname));
  }, [location.pathname]);


  return (
    <Box sx={{ display: 'flex' }}>
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

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3 }}
      >
        <Toolbar />

      <RelayContext.Provider value={{relays, setRelays}}>
        <Routes>
            <Route path="create" element={<Create />} />
            <Route path="issue" element={<Issue />} />
            <Route path="badges" element={<Badges />} />
            <Route path="test" element={<Test />} />
        </Routes>
      </RelayContext.Provider>
      </Box>

    </Box>
  );
}
