import { Typography, Grid, TextField, Box, Card, CardMedia, CardActionArea } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';
import { Multiline } from './Multiline';
import ImageSelect from './ImageSelect';
import { SignWithExtension } from './SignWithExtension';
import * as nostr from 'nostr-tools';
import { createBadgeEvent } from '../NostrUtil';

const defaultFormData = {
    id: "",
    pubkey: "",
    uniqueName: "",
    name: "",
    description: "",
    image: "/images/add.svg",
    imageDimensions: "",
    thumb: "",
    thumbDimensions: ""
}

export default function Create()
{
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

    const [formData, setFormData] = useState(initFormData);

    const [isPublished, setIsPublished] = useState(false);
    const [relayURLS, setRelayURLs] = React.useState(["ws://localhost:8008"]);

    /***** START Image Selector Dialog *****/
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState("");

    const handleClickOpen = () => {
        setOpen(true);
      };
    
    const handleClose = (value: string) => {
        setOpen(false);
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

    const { id, pubkey, uniqueName, name, description, image, imageDimensions, thumb, thumbDimensions } = formData;
    const pool = useRef<nostr.SimplePool | null>(null);
    const openRelays = useRef<string[] | null>(null);


    // first render and cleanup
    useEffect(() => {
        // loadTest();
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    ;

    
    // const loadTest = () =>
    // {
    //     setFormData((prevState) => ({
    //         ...prevState,
    //         uniqueName: "",
    //         name: "",
    //         description: "",
    //         image: `${getBaseUrl(window.location.href)}/images/add.svg`,
    //         imageDimensions: "",
    //         thumb: "",
    //         thumbDimensions: ""
    //     }));
    // }

    const onEventSigned = (event: Event, mesg: string) => {

    }

    const createEvent = async () =>
    {
        setLog('Creating badge...');
        const event = createBadgeEvent({
            uniqueName: uniqueName,
            name: name,
            description: description,
            image: image,
            imageDimensions: imageDimensions,
            thumb: thumb,
            thumbDimensions: thumbDimensions,
            publicKey: await (window as any).nostr.getPublicKey()
        });
   
        event.id = nostr.getEventHash(event)        

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

        let ok = nostr.validateEvent(event);
        let veryOk = nostr.verifySignature(event);
        if (!ok || !veryOk)
        {
            appendLog('Not a valid event');
            return;
        }

        appendLog(`About to send event with id ${event.id.substring(0,10)}...`);

        if (pool.current && relayURLS && relayURLS.length > 0)
        {
            const goodURLs = new Array<string>();
            for (let i=0; i<relayURLS.length; i++)
            {
                if (relayURLS[i].length > 0)
                goodURLs.push(relayURLS[i]);
            } 
            
            if (goodURLs.length == 0)
            {
                appendLog('No relay URLs specified');
                return;
            }

            appendLog(`Waiting for connection to first relay ${goodURLs[0]}`);
            await pool.current.ensureRelay(goodURLs[0]);

            try {
                openRelays.current = goodURLs;
                openRelays.current.map( (relay) => console.log(`Added relay to open connections ${relay}`));

                let pub = pool.current!.publish(goodURLs!,
                    event);

                pub.on('ok', () => {
                    appendLog(`At least one relay has accepted our event`);
                    setIsPublished(true);
                });

                pub.on('failed', (reason: any) => {
                    appendLog(`failed to publish to event: ${reason}`)
                });
            } catch (error)
            {
                appendLog(`Publish event error ${error}`);
            }
        }
    }

    function textChangeHandler(lines: string[])
    {
        setRelayURLs(lines);
    }

    const onClickHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        createEvent();
    }

    return (
        <Box  display='flex' flexDirection='column' alignItems='center'>
            <Grid container spacing={1} maxWidth='md'>
                {id != "" && 
                <>
                <Grid item xs={12}>
                    <TextField
                        id="id"
                        size="small"
                        label="Badge Event Id"
                        fullWidth
                        variant="standard"
                        value={id}
                        InputProps={{readOnly: true}}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="issuerPubkey"
                        size="small"
                        label="Pubkey"
                        fullWidth
                        variant="standard"
                        value={pubkey}
                        InputProps={{readOnly: true}}
                    />
                </Grid>
                </>
                }
                <Grid item xs={12}>
                    <Typography variant='h6'>Badge Text</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <TextField
                        required
                        id="uniqueName"
                        size="small"
                        label="Unique Name"
                        fullWidth
                        variant="standard"
                        value={uniqueName}
                        onChange={handleChange}
                        helperText={"\"bravery\""}
                    />
                </Grid>
                <Grid item xs={12} sm={9}>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        required
                        id="name"
                        size="small"
                        label="Name"
                        fullWidth
                        variant="standard"
                        value={name}
                        onChange={handleChange}
                        helperText={"\"Medal of Bravery\""}
                    />
                </Grid>
                <Grid item xs={12} sm={8}>
                    <TextField
                        required
                        id="description"
                        size="small"
                        label="Description"
                        fullWidth
                        variant="standard"
                        value={description}
                        onChange={handleChange}
                        helperText={"\"Awarded to users demonstrating bravery\""}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant='h6'>Badge Image</Typography>
                </Grid>
                <Grid container spacing={1} columnSpacing={2}>
                    <Grid item xs={6} sm={2}>
                        <CardActionArea onClick={handleClickOpen}>
                            <Card  sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F5F5F5' }} >                      
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
                    <Grid item xs={12} sm={8}>
                        <TextField
                            required
                            id="image"
                            size="small"
                            label="Image URL"
                            fullWidth
                            variant="standard"
                            value={image}
                            onChange={handleChange}
                            helperText={"\"https://nostr.academy/awards/bravery.png\""}
                        />
                        <Box pt={2}>
                            <TextField
                            id="thumb"
                            size="small"
                            label="Thumb URL"
                            fullWidth
                            variant="standard"
                            value={thumb}
                            onChange={handleChange}
                            helperText={"\"https://nostr.academy/awards/bravery_256x256.png\""
                            }
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField
                            id="imageDimensions"
                            size="small"
                            label="Image Dim."
                            fullWidth
                            variant="standard"
                            value={imageDimensions}
                            onChange={handleChange}
                            helperText={"\"1024x1024\""}
                        />
                        <Box pt={2}>
                            <TextField
                                id="thumbDimensions"
                                size="small"
                                label="Thumb Dim."
                                fullWidth
                                variant="standard"
                                value={thumbDimensions}
                                onChange={handleChange}
                                helperText={"\"256x256\""}
                            />
                        </Box>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant='h6'>Relays (one per line)</Typography>
                    <Multiline lines={relayURLS} onTextChange={textChangeHandler} fullWidth></Multiline>
                </Grid>
            </Grid>
            <Box sx={{ m: 4}}>
                <SignWithExtension name='Create Badge Event' variant='contained' onClick={onClickHandler}/>
            </Box>
            
            <ImageSelect
                selectedValue={selectedValue}
                open={open}
                onClose={handleClose}
            />
            <Box maxWidth='md' sx={{ border: 1, width: 1, padding: 1, borderColor: 'grey.400' }}>
            <Typography textAlign='left' align='left' alignContent='left' component={'span'}>
                <pre style={{ fontFamily: "inherit" }}>{log}</pre>
            </Typography>
            </Box>
        </Box>  
    )
}
