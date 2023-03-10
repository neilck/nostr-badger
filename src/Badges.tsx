import { Typography, Grid, TextField, Button, Dialog, Box } from '@mui/material';
import Badge from './components/Badge';
import React, { useEffect, useState, useRef, useContext } from 'react';
import * as nostr from 'nostr-tools';
import { createDeleteEvent } from './NostrUtil';
import { getRelayContext } from './RelayContext';

export default function Badges()
{
    // dialog
    const [open, setOpen] = useState(false);
    const [mesg, setMesg] = useState("mesg");
    // const [publicKey, setPublicKey] = useState("43094d0a6b72dd5b294e6ac3abcf4740a1867449330976b0394888cf1bda3819");
    // const [publicKey, setPublicKey] = useState("npub1gvy56zntwtw4k22wdtp6hn68gzscvazfxvyhdvpefzyv7x768qvszk4cr5");
    const [publicKey, setPublicKey] = useState("");
    const [badges, setBadges] = useState<nostr.Event[]>([]);
    const relay = getRelayContext().relay;
    const [hasProvider, setHasProvider] = useState(true);

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
        if (pubkey != event.pubkey)
        {
            displayMesg("Can not delete badge issued by different public key")
            return;
        }

        const deleteEventTemplate = createDeleteEvent( event.id );
        let deleteEvent: any;

        let signatureOrEvent = await (window as any).nostr.signEvent(deleteEventTemplate)
        switch (typeof signatureOrEvent) {
            case 'string':
                displayMesg(`Error signing with Nostr extension:  ${signatureOrEvent}`);
                return;
            case 'object':
                deleteEvent = signatureOrEvent;
                console.log(`Event signed with sig: ${event.sig.substring(0,10)}...`)
                break;
            default:
                displayMesg('Failed to sign with Nostr extension.');
                return;
        }

        pool.current.ensureRelay(relay);
    
        try {
            let pub = pool.current!.publish([relay], deleteEvent);

            pub.on('ok', () => {
                // this may be called multiple times, once for every relay that accepts the event
                displayMesg(`Relay has accepted our delete event`);
            });

            pub.on('failed', (reason: any) => {
                displayMesg(`Failed to publish to delete event: ${reason}`)
            });
        } catch (error)
        {
            displayMesg(`Publish delete event error ${error}`);
        }
    }

    function displayMesg(myMesg: string)
    {
        setMesg(myMesg);
        setOpen(true);
    }

    
    // first render and cleanup
    useEffect(() => {
        pool.current = new nostr.SimplePool();
        console.log('Pool initialized');
       
        // if (relay && relay != "")
        // {
        //     getBadges(relay);
        // }

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
        if (e.target.id == "publicKey") setPublicKey((prevState) => (e.target.value));
    };

    const loadPublicKey = async () =>
    {
        if ((window as any).nostr)
        {
            try{ 
                const publicKey = await (window as any).nostr.getPublicKey();
                setPublicKey(publicKey);
            }
            catch (error)
            {
                setHasProvider(false);
                console.log(error);
                return;
            }
            setHasProvider(true);

        }
        else{
            setHasProvider(false);
        }
    }

    const getBadges = async (relay: string) =>
    {
        setBadges([]);

        if (relay.length == 0)
            return;

        if (pool.current)
        {
            try{
                console.log(`checking relay: ${relay}`);
                await pool.current?.ensureRelay(relay);
            } catch (e)
            {
                console.log(e);
                return;
            }

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
                console.log(`found badge ${event.id}`)
                setBadges( (currentState) => [...currentState, event]);
            });
            sub.on('eose', () => {
                console.log(`eose`)
                sub.unsub();
            });
        }  
    };

    return (
        <>
        <Box  width={1} display='flex' flexDirection='column' alignItems='center' justifyContent='bottom'>
   
            <Grid container spacing={1}>
                <Grid item xs={9} >
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
                <Grid item xs={3}>
                    <Box height={1} display='flex' flexDirection='column' justifyContent='flex-end' alignContent='center'>
                        <Button variant='outlined' onClick={(e) => loadPublicKey() }>
                            My Pubkey
                        </Button>
                        { hasProvider ? <Box sx={{ height: "20px" }}>&nbsp;</Box> : 
                        <Typography height='120px6px' align='center' color='red'>requires extension</Typography> }
                    </Box>
                    
                </Grid>
            </Grid>
            <Button variant='contained' onClick={ (e) => { getBadges(relay) }}>Get Badges</Button>
            <Box sx={{mt: 4}}>
                <Grid container spacing={4} maxWidth='md'>
                    {badges.map( (badge: nostr.Event, index: number, array: nostr.Event[]) => (
                    <Grid item key={index} xs={12} >
                        <Badge event={badge} onDelete={onDelete} />
                    </Grid>
                    ))}
                </Grid>
            </Box>
            <Dialog open={ open } onClick={ () => setOpen(false) }>
                <Box sx={{margin: 2, padding: 2}}>
                    <Typography>{mesg}</Typography>
                </Box>
            </Dialog>
        </Box>  
        </>      
    )
}
