import { TextField, Button, Box, Typography } from '@mui/material';
import Badge from './components/Badge';
import { useState, useEffect, useRef } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import * as nostr from 'nostr-tools';
import { getRelayContext } from './RelayContext';
import { createAwardEvent } from './NostrUtil';
import { SignWithExtension } from './components/SignWithExtension';
import { Multiline } from './components/Multiline';


const Award = () => {

    const [badge, setBadge] = useState<nostr.Event>();
    const [lines, setLines] = useState<string[]>([""]);
    const pool = useRef<nostr.SimplePool | null>(null);
    const relay = getRelayContext().relay;
    const openRelays = useRef<string[] | null>(null);

    /***** START Log *****/
    const[log, setLog] = useState("");

    const appendLog = (mesg: string) => {
        setLog((prevState) => {
            return `${prevState}\n${mesg}`
        })
    }
    /***** END Log *****/

    // first render and cleanup
    useEffect(() => {
        pool.current = new nostr.SimplePool();
        console.log('Pool initialized');

        return() => {
            // add any cleanup code here
            if (pool.current && openRelays.current)
            {
                openRelays.current.map( (relay) => {
                    console.log(`Closing connection to ${relay}`);
                })
                pool.current.close(openRelays.current);
            }
        }
    }, []);

   //  let badge: nostr.Event | null = null;
    // Handle data from Badge component's react router dom Link
    let state = useLocation().state;
    if (state && state.fromBadge)
    {
        const badge: nostr.Event = state.fromBadge;
        setBadge(badge);
        useLocation().state.fromBadge = undefined;
    }
    else if (!badge)
    {
        return <Navigate to="/badges" replace={true} />
    }

    const onTextChangeHandler = (lines: string[]) =>
    {
        setLines(lines);
    }

    // creates event
    const awardEvent = async () =>
    {
        setLog('Awarding badge...');

        // create event from state values
        const issuer = badge!.pubkey;
        let uniqueName = "";
        for (let i=0; i<badge!.tags.length; i++)
        {
            if (badge!.tags[i][0] == "d")
            {
                uniqueName = badge!.tags[i][1];
                break;
            }
        }

        const pubkeys = new Array<string>();
        lines.map( (line) => {
            if (line.length == 0) return;

            if (line.startsWith("npub"))
            {
                const data = nostr.nip19.decode(line).data;
                if (typeof data == "string")
                {
                    pubkeys.push(data);
                }
            } else 
            {
                pubkeys.push(line);
            }
        })

        if (pubkeys.length == 0)
        {
            appendLog('No pubkeys specified.');
            return;
        }

        const event = createAwardEvent(issuer, uniqueName, relay, pubkeys);

    
        // sign event using NIP-07 browser extension
        // UI prevents this function from being called when window.nostr doesn't exist
        if ((window as any).nostr) {
            let signatureOrEvent = await (window as any).nostr.signEvent(event)
            switch (typeof signatureOrEvent) {
                case 'string':
                    appendLog(`Sign event returned string ${signatureOrEvent}`);
                    return;
                case 'object':
                    event.sig = signatureOrEvent.sig;
                    appendLog(`Event signed with sig: ${event.sig.substring(0,10)}...`)
                    break;
                default:
                    appendLog('Failed to sign with Nostr extension.');
                    return;
            }
        }

        // double check all good
        let ok = nostr.validateEvent(event);
        let veryOk = nostr.verifySignature(event);
        if (!ok || !veryOk)
        {
            appendLog('Not a valid event');
            return;
        }

        appendLog(`About to send event with id: ${event.id.substring(0,10)}...`);
        appendLog( JSON.stringify(event, null, 2));
        if (relay.length == 0)
        {
            appendLog('No relay URL specified');
            return;
        }

        // send event to relays
        if (pool.current)
        {           
            // pool.current.publish sometimes tries to send event before websocket connection established
            // ensure at least the first relay is relay
            appendLog(`Waiting for connection to first relay ${relay}`);
            await pool.current.ensureRelay(relay);

            try {
                openRelays.current = [relay];
                openRelays.current.map( (relay) => console.log(`Added relay to open connections ${relay}`));

                let pub = pool.current!.publish([relay],
                    event);

                pub.on('ok', () => {
                    // this may be called multiple times, once for every relay that accepts the event
                    appendLog(`Relay has accepted our event`);
                });

                pub.on('failed', (reason: any) => {
                    appendLog(`Failed to publish to event: ${reason}`)
                });
            } catch (error)
            {
                appendLog(`Publish event error ${error}`);
            }
        }
    }

    return (
        <Box>
            { badge && <Badge event={badge} readOnly ></Badge>}
            <Typography fontWeight={600} sx={{width: 1, mt: 3}}>Recipient pukey hex or npub keys (one per line)</Typography>
            
            <Multiline lines={lines} onTextChange={onTextChangeHandler}></Multiline>

            <Box display='flex' flexDirection='column' alignItems='center'>
                <br></br>
                <SignWithExtension name='Award Badges' variant='contained' onClick={awardEvent}/>
            </Box>
            <Box maxWidth='md'>           
                <Typography textAlign='left' align='left' alignContent='left' component={'span'}>
                    <pre style={{ fontFamily: "inherit" }}>{log}</pre>
                </Typography>
            </Box>
        </Box>

    );
};

export default Award;