/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import BadgeIcon from '@mui/icons-material/Badge';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import MailIcon from '@mui/icons-material/Mail';
import { Link } from 'react-router-dom';
import { Typography } from '@mui/material';

export default function LeftDrawer() {
  const navMap = new Map();
  navMap.set("", "Nostr Badger");
  navMap.set("create", "Create Badge");
  navMap.set("award", "Award Badge");
    
  const mapIter = navMap.keys();

  return (
    <Drawer variant="permanent" anchor="left">
    <Toolbar>
      <Typography variant="h6">Nostr Badger</Typography>
      </Toolbar>
    <Divider />
    <List>
      <ListItem disablePadding component={Link} to={"/badges"} 
        css={css`color: #000000DE;`}>
        <ListItemButton>
          <ListItemIcon>
            <BadgeIcon />
          </ListItemIcon>
          <ListItemText primary="Badge Explorer" />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding component={Link} to={"/create"} 
        css={css`color: #000000DE;`}>
        <ListItemButton>
          <ListItemIcon>
            <AddBoxIcon />
          </ListItemIcon>
          <ListItemText primary="Publish Badge" />
        </ListItemButton>
      </ListItem>
    </List>
    <Divider />
    </Drawer>
  )
};