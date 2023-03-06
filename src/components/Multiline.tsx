import { Typography, Grid, TextField, Button, Box, Card, CardMedia, CardActionArea } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState, useRef } from 'react';

interface MultlineProps {
    lines: string[]
}

function arrayToString(lines: string[]): string
{
    let all = "";
    lines.map( (line) => all = `${all}\n${line}`)
    return all;
}

function stringToArray(all: string): string[]
{
    return all.split('\n');
}


export function Multiline(props: MultlineProps)
{
    
    const [data, setData] = useState([""]);

    return (
        <TextField multiline>
            my text
        </TextField>
    )
}