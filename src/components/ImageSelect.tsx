import { Typography, Grid, Card, CardMedia, Box, CardActionArea } from '@mui/material';

import React, { useEffect, useState, useRef } from 'react';
import { useLinkClickHandler } from 'react-router-dom';

export default function ImageSelect()
{
    const filenames = [
        "01_lightning.png",
        "02_bitcoin.png",
        "10_twitter.png",
        "11_instagram.png",
        "12_facebook.png",
        "13_linkedin.png",
        "20_bronze.png",
        "21_silver.png",
        "22_gold.png",
        "30_empire.png",
        "31_rebel.png",
        "32_stormtrooper.png",
        "100_ok.png",
        "101_anonymous.png",
        "102_bookmark.png",
        "103_lasergun.png",
        "104_heart.png",
        "105_thanks.png",
        "106_medal.png"
    ]

    const [selected, setSelected] = useState("");

    const clickHandler = (filename: string) => {
        setSelected(filename)
    }

    return (
        <>
            <Typography>{selected}</Typography>
            <Grid container spacing={4}>
                {filenames.map((filename) => (
                    <Grid item key={filename} xs={12} sm={4} md={2} >
                    <CardActionArea onClick={() => clickHandler(filename)}>
                    <Card  sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F5F5' }} >
                        {/*}
                        <Box m={1} p={2}>
                            <Typography variant="subtitle2">
                            {filename}
                            </Typography>
                </Box> */}
                    
                    <CardMedia
                        component="img"
                        sx={{
                            padding: "1em 1em 1em 1em", objectFit: "contain" 
                        // 16:9
                        // pt: '56.25%',
                        }}
                        image={`/images/${filename}`}
                        alt="{filename}"
                    />
                    </Card>
                    </CardActionArea>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}