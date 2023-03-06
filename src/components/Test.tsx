import { Typography, Grid, TextField, Button, Box, Card, CardMedia, CardActionArea } from '@mui/material';
import { Multiline } from './Multiline';
import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState, useRef } from 'react';

const Test = () =>
{
    return (
        <>
            <Typography>Test</Typography>
            <Multiline lines={["line 1", "line 2"]}></Multiline>
        </>
    )
}

export default Test;