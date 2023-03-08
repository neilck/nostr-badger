import { Typography, Grid, TextField, Button, Card, CardMedia, CardContent, CardActions, Box } from '@mui/material';
import Badge from './components/Badge';

import React, { useEffect, useState, useRef } from 'react';
import * as nostr from 'nostr-tools';
import { createDeleteEvent } from './NostrUtil';

export default function Badges()
{
    const [relay, setRelay] = useState("ws://localhost:8008");
    // const [publicKey, setPublicKey] = useState("43094d0a6b72dd5b294e6ac3abcf4740a1867449330976b0394888cf1bda3819");
    // const [publicKey, setPublicKey] = useState("npub1gvy56zntwtw4k22wdtp6hn68gzscvazfxvyhdvpefzyv7x768qvszk4cr5");
    const [publicKey, setPublicKey] = useState("");
    const [badges, setBadges] = useState<nostr.Event[]>([]);
    const pool = useRef<nostr.SimplePool | null>(null);

    const onDelete = async (event: nostr.Event) => {
        if (!(window as any).nostr)
        {
            console.log('window.nostr not defined')
            return;
        }

        if (!pool.current)
        {
            console.log('pool.current not defined')
            return;
        }
            
        const pubkey = await (window as any).nostr.getPublicKey();
        const deleteEventTemplate = createDeleteEvent( event.id );
        let deleteEvent: any;

        let signatureOrEvent = await (window as any).nostr.signEvent(deleteEventTemplate)
        switch (typeof signatureOrEvent) {
            case 'string':
                console.log(`Sign event returned string ${signatureOrEvent}`);
                return;
            case 'object':
                deleteEvent = signatureOrEvent;
                console.log(`Event signed with sig: ${event.sig.substring(0,10)}...`)
                break;
            default:
                console.log('Failed to sign with Nostr extension.');
                return;
        }

        pool.current.ensureRelay(relay);
    
        try {
            let pub = pool.current!.publish([relay], deleteEvent);

            pub.on('ok', () => {
                // this may be called multiple times, once for every relay that accepts the event
                console.log(`Relay has accepted our event`);
            });

            pub.on('failed', (reason: any) => {
                console.log(`Failed to publish to event: ${reason}`)
            });
        } catch (error)
        {
            console.log(`Publish event error ${error}`);
        }
    }
    
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
            let pubkey = publicKey;
            if (pubkey && pubkey != "")
            {
                if (pubkey.startsWith("npub"))
                {
                    const data = nostr.nip19.decode(pubkey).data;
                    if (typeof data == "string")
                        pubkey = data;
                }

                filter = {
                    kinds: [30009],
                    authors: [pubkey],
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
                setBadges( (currentState) => [...currentState, event]);
                
                console.log(`found badge ${event.id}`)
            });
            sub.on('eose', () => {
                sub.unsub();
            });
        }  
    };

    return (
        <Box  display='flex' flexDirection='column' alignItems='center'>
            <Grid container spacing={1} maxWidth='md'>
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
                        helperText={"hexcode or npub..."}
                        onChange={handleChange}
                    />
                </Grid>
                
            </Grid>
            <Button variant='contained' onClick={getBadges}>Get Badges</Button>
            <Box sx={{mt: 4}}>
                <Grid container spacing={4} maxWidth='md'>
                    {badges.map( (badge: nostr.Event, index: number, array: nostr.Event[]) => (
                    <Grid item key={index} xs={12} >
                        <Badge event={badge} onDelete={onDelete} />
                    </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>        
    )
}
