import { Typography, Grid, TextField, Button } from '@mui/material';

import React, { useEffect, useState, useRef } from 'react';
import * as nostr from 'nostr-tools';

export default function Badges()
{
    const [relay, setRelay] = useState("ws://localhost:8008");
    const [publicKey, setPublicKey] = useState("43094d0a6b72dd5b294e6ac3abcf4740a1867449330976b0394888cf1bda3819");
    const [privateKey, setPrivateKey] = useState("c58964e1825506d43cff78558d4cd1ac784d7b44da07ce5cb5eac498ba821062");

    const pool = useRef<nostr.SimplePool | null>(null);
    const relays = useRef<string[] | null>(null);

    // first render and cleanup
    useEffect(() => {
        pool.current = new nostr.SimplePool();
        relays.current = [relay];
        console.log('Pool initialized');

        return() => {
            // add any cleanup code here
            if (pool.current && relays.current)
            {
                pool.current.close(relays.current);
                console.log('Pool cleanup');
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        if (e.target.id == "relay") setRelay((prevState) => (e.target.value));
        if (e.target.id == "publicKey") setPublicKey((prevState) => (e.target.value));
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
            <Button>Get Badges</Button>
        </React.Fragment>        
    )
}
