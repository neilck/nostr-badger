import { Typography, Grid, TextField, Box, Card, CardMedia, CardActionArea } from '@mui/material';
import ImageSelect from './components/ImageSelect';
import { SignWithExtension } from './components/SignWithExtension';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import * as nostr from 'nostr-tools';
import { createBadgeEvent } from './NostrUtil';
import { getRelayContext } from './RelayContext';

const defaultFormData = {
    id: "",
    uniqueName: "",
    name: "",
    description: "",
    image: `${getBaseUrl(window.location.href)}/images/add.svg`,
    imageDimensions: "",
    thumb: "",
    thumbDimensions: ""
}

function initFormData()
{
    return defaultFormData;
}

function getBaseUrl(url: string)
{
    const i = url.lastIndexOf("/");
    if (i > 0)
        return url.substring(0, i);
    return url;
}

export default function Create()
{

    /***** START Image Selector Dialog *****/
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState("");
    
    const handleImageSelectClose = (value: string) => {
        setIsDialogOpen(false);
        setSelectedValue(value);
        setFormData((prevState) => ({
            ...prevState,
            image: `${getBaseUrl(window.location.href)}/images/${value}`,
            imageDimensions: "",
            thumb: "",
            thumbDimensions: ""
        }));
    };
    /***** END Image Selector Dialog *****/
    
    /***** START Log *****/
    const[log, setLog] = React.useState("");

    const appendLog = (mesg: string) => {
        setLog((prevState) => {
            return `${prevState}\n${mesg}`
        })
    }
    /***** END Log *****/

    const [formData, setFormData] = useState(initFormData);
    const { id, uniqueName, name, description, image, imageDimensions, thumb, thumbDimensions } = formData;
    const pool = useRef<nostr.SimplePool | null>(null);
    const relay = getRelayContext().relay;

    const openRelays = useRef<string[] | null>(null);


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

    const updateFormDataFromEvent = (event: nostr.Event) =>
    {
        const { id, kind, tags, content, created_at, pubkey, sig } = event;
        let uniqueName = "";
        let name = "";
        let description = "";
        let image = "";
        let imageDimensions = "";
        let thumb = "";
        let thumbDimensions = "";
        
        if (tags)
        {
            tags.forEach(element => {
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
        }

        setFormData((prevState) => ({
            id: id,
            uniqueName: uniqueName,
            name: name,
            description: description,
            image: image,
            imageDimensions: imageDimensions,
            thumb: thumb,
            thumbDimensions: thumbDimensions
        }));
    }

    // Handle data from Badge component's react router dom Link
    let state = useLocation().state;
    if (state && state.fromBadge)
    {
        updateFormDataFromEvent( state.fromBadge );
        useLocation().state.fromBadge = undefined;
    }

    // update state when form field value changes
    const onTextFieldChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    ;

    // creates event
    const createEvent = async () =>
    {
        setLog('Creating badge...');

        // create event from state values
        const event = createBadgeEvent({
            uniqueName: uniqueName,
            name: name,
            description: description,
            image: image,
            imageDimensions: imageDimensions,
            thumb: thumb,
            thumbDimensions: thumbDimensions,
            // get public key from NIP-07 browser extension
            publicKey: await (window as any).nostr.getPublicKey()
        });
    
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
        <Box  display='flex' flexDirection='column' alignItems='center'>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Typography fontWeight={600}>Badge</Typography>
                </Grid>
                <Grid container spacing={1} columnSpacing={2}>
                    <Grid item xs={6} sm={2}>
                        <CardActionArea onClick={ () => { setIsDialogOpen(true) } }>
                            <Card  sx={{  display: 'flex', flexDirection: 'column', backgroundColor: '#F5F5F5' }} >                      
                                <CardMedia
                                    component="img"
                                    sx={{
                                        padding: "1em 1em 1em 1em", objectFit: "contain" 
                                    // 16:9
                                    // pt: '56.25%',
                                    }}
                                    image={ image == "" ? "/images/add.svg" : image }
                                    alt="badge image"
                                />
                            </Card>
                        </CardActionArea>
                    </Grid>
                    <Grid item xs={12} sm={10}>
                        <Box width={0.5}>
                            <TextField
                                required
                                id="uniqueName"
                                size="small"
                                label="Unique Name"
                                fullWidth
                                variant="outlined"
                                value={uniqueName}
                                onChange={onTextFieldChangeHandler}
                            />
                            <Box pt={1} pb={1}>
                                <TextField
                                    required
                                    id="name"
                                    size="small"
                                    label="Name"
                                    fullWidth
                                    variant="outlined"
                                    value={name}
                                    onChange={onTextFieldChangeHandler}
                                />
                            </Box>
                        </Box>  
                        <TextField
                            required
                            id="description"
                            size="small"
                            label="Description"
                            fullWidth
                            variant="outlined"
                            value={description}
                            onChange={onTextFieldChangeHandler}
                        />
                    </Grid>                       
                </Grid>
                <Grid item xs={12}>
                    <Typography fontWeight={600}>Image URLs</Typography>
                </Grid>
                <Grid item xs={12} sm={10}>
                    <TextField
                        required
                        id="image"
                        size="small"
                        label="Image URL"
                        fullWidth
                        variant="outlined"
                        value={image}
                        onChange={onTextFieldChangeHandler}
                    />
                    <Box pt={1}>
                        <TextField
                        id="thumb"
                        size="small"
                        label="Thumb URL"
                        fullWidth
                        variant="outlined"
                        value={thumb}
                        onChange={onTextFieldChangeHandler}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={2}>
                    <TextField
                        id="imageDimensions"
                        size="small"
                        label="Image Dim."
                        fullWidth
                        variant="outlined"
                        value={imageDimensions}
                        onChange={onTextFieldChangeHandler}
                    />
                    <Box pt={1}>
                        <TextField
                            id="thumbDimensions"
                            size="small"
                            label="Thumb Dim."
                            fullWidth
                            variant="outlined"
                            value={thumbDimensions}
                            onChange={onTextFieldChangeHandler}
                        />
                    </Box>
                </Grid>


            </Grid> {/* end grid */}
        
        <Grid>
                                
        
                    
            </Grid>
            <Box sx={{ m: 4}}>
                <SignWithExtension name='Publish Badge Event' variant='contained' onClick={createEvent}/>
            </Box>
            <ImageSelect
                selectedValue={selectedValue}
                open={isDialogOpen}
                onClose={handleImageSelectClose}
            />
            {/* <Box maxWidth='md' sx={{ border: 1, width: 1, padding: 1, borderColor: 'grey.400' }}> */ }
            <Box maxWidth='md'>           
                <Typography textAlign='left' align='left' alignContent='left' component={'span'}>
                    <pre style={{ fontFamily: "inherit" }}>{log}</pre>
                </Typography>
            </Box>
        </Box>  
    )
}
