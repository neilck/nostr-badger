import { Typography, Grid, TextField, Button, Box, Card, CardMedia, CardActionArea, TextFieldProps, StandardTextFieldProps } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState, useRef } from 'react';

interface MultlineProps extends StandardTextFieldProps {
    lines: string[],
    onTextChange: (lines: string[]) => void 
}

function arrayToString(lines: string[]): string
{
    let all = "";
    for (let i=0; i<lines.length; i++)
    {
        if (i==0) all = lines[0];
        else all = `${all}\n${lines[i]}` 
    }
       
        
    return all;
}

function stringToArray(all: string): string[]
{
    return all.split('\n');
}

export function Multiline({lines, onTextChange, ...rest}: MultlineProps)
{
    function onChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>)
    {
        onTextChange(stringToArray(event.target.value));
    }

    return (
        <TextField multiline onChange={onChange} value={arrayToString(lines)} {...rest} />
    )
}