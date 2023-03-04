import { Typography, Grid, TextField, Button, Card, CardMedia, CardContent, CardActions, Box } from '@mui/material';
import { BadgeDefinition } from '../BadgeInterfaces';

import React, { useEffect, useState, useRef } from 'react';
import * as nostr from 'nostr-tools';

export default function Badges()
{
    const [relay, setRelay] = useState("ws://localhost:8008");
    const [publicKey, setPublicKey] = useState("43094d0a6b72dd5b294e6ac3abcf4740a1867449330976b0394888cf1bda3819");
    const [badges, setBadges] = useState<BadgeDefinition[]>([]);

    const pool = useRef<nostr.SimplePool | null>(null);

    // first render and cleanup
    useEffect(() => {
        pool.current = new nostr.SimplePool();
        console.log('Pool initialized');

        return() => {
            // add any cleanup code here
            if (pool.current && relay)
            {
                pool.current.close([relay]);
                console.log('Pool cleanup');
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        if (e.target.id == "relay") setRelay((prevState) => (e.target.value));
        if (e.target.id == "publicKey") setPublicKey((prevState) => (e.target.value));
    };

    const getBadges = async () =>
    {
        setBadges([]);
        if (pool.current)
        {
            await pool.current?.ensureRelay(relay);

            let filter: any;
             
            if (publicKey && publicKey != "")
            {
                filter = {
                    kinds: [30009],
                    authors: [publicKey],
                    limit: 100
                }
            }
            else {
                filter = {
                    kinds: [30009],
                    limit: 100
                }
            }

            let sub = pool.current.sub([relay], [filter]);
            sub.on('event', (event: nostr.Event) => {
                // Tags
                // ["d", uniqueName],
                // ["name", name],
                // ["description", description],
                // ["image", image, imageDimensions],
                // ["thumb", thumb, thumbDimensions]

                let uniqueName = "";
                let name = "";
                let description = "";
                let image = "";
                let imageDimensions = "";
                let thumb = "";
                let thumbDimensions = "";

                event.tags.forEach(element => {
                    const tagName = element[0];
                    const length = element.length;
                    switch (tagName) {
                        case "d":
                            if (length > 1) uniqueName = element[1];
                            break;
                        case "name":
                            if (length > 1) name = element[1];
                            break;
                        case "description":
                            if (length > 1) description = element[1];
                            break;
                        case "image":
                            if (length > 1) image = element[1];
                            if (length > 2) imageDimensions = element[2];
                            break;
                        case "thumb":
                            if (length > 1) thumb = element[1];
                            if (length > 2) thumbDimensions = element[2];
                            break;
                    }
                 });
                const badge: BadgeDefinition =
                {
                    id: event.id,
                    issuerPubkey: event.pubkey,
                    uniqueName: uniqueName,
                    name: name,
                    description: description,
                    image: image,
                    imageDimensions: imageDimensions,
                    thumb: image,
                    thumbDimensions: thumbDimensions,
                    content: event.content
                };

                setBadges( (currentState) => [...currentState, badge]);
                
                console.log(`found badge ${event.id}`)
            });
            sub.on('eose', () => {
                sub.unsub();
            });
        }  
    };

    return (
        <React.Fragment>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="relay"
                        label="Relay"
                        fullWidth
                        variant="standard"
                        value={relay}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} >
                    <TextField
                        id="publicKey"
                        label="Public Key"
                        fullWidth
                        variant="standard"
                        value={publicKey}
                        helperText={"\"npub...\""}
                        onChange={handleChange}
                    />
                </Grid>
                
            </Grid>
            <Button onClick={getBadges}>Get Badges</Button>
        
            <Grid container spacing={4}>
                {badges.map( (badge: BadgeDefinition, index: number, array: BadgeDefinition[]) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                    <Card
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                        <Box m={1}>
                            <Typography variant="subtitle2">
                            {badge.uniqueName}
                            </Typography>
                        </Box>
                    
                    <CardMedia
                        component="img"
                        sx={{
                        // 16:9
                        pt: '56.25%',
                        }}
                        image={badge.image}
                        alt="badge image"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="h2">
                        {badge.name}
                        </Typography>
                        <Typography>
                        {badge.description}
                        </Typography>
                        
                    </CardContent>
                    <CardActions>
                        <Button size="small">View</Button>
                        <Button size="small">Edit</Button>
                    </CardActions>
                    </Card>
                </Grid>
                ))}
            </Grid>
        </React.Fragment>        
    )
}
