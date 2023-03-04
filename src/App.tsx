import { useEffect, useState } from 'react'; 
import { useLocation, Location } from 'react-router-dom';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LeftDrawer from './components/LeftDrawer';
import Create from './components/Create';
import Issue from './components/Issue';
import Badges from './components/Badges';
import ImageSelect from './components/ImageSelect';
import { Route, Routes } from 'react-router-dom';

const drawerWidth = 240;
type Title = {
  path: string;
  name: string;
}


export default function App() {
  const titleMap = new Map();
  titleMap.set("/", "Nostr Badger");
  titleMap.set("/badges", "Badges");
  titleMap.set("/create", "Create Badge");
  titleMap.set("/issue", "Issue Badge");
  titleMap.set("/imageselect", "Image Select");
  
  const location = useLocation();
  const [title, setTitle] = useState(titleMap.get("/"));

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

      <Routes>
        <Route path="create" element={<Create />} />
        <Route path="issue" element={<Issue />} />
        <Route path="badges" element={<Badges />} />
        <Route path="imageselect" element={<ImageSelect />} />
      </Routes>
      </Box>

    </Box>
  );
}
