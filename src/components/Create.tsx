import { Typography, Grid, TextField, Button, Box, Card, CardMedia, CardActionArea } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState, useRef } from 'react';
import ImageSelect from './ImageSelect';
import * as nostr from 'nostr-tools';
import { Container } from '@mui/system';


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
    const [privateKey, setPrivateKey] = useState("c58964e1825506d43cff78558d4cd1ac784d7b44da07ce5cb5eac498ba821062");
    const [publicKey, setPublicKey] = useState("43094d0a6b72dd5b294e6ac3abcf4740a1867449330976b0394888cf1bda3819");
    const [isPublished, setIsPublished] = useState(false);
    const [createdAt, setCreatedAt] = useState(0);

    // Dialog
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

    const { id, pubkey, uniqueName, name, description, image, imageDimensions, thumb, thumbDimensions } = formData;

    const pool = useRef<nostr.SimplePool | null>(null);
    const relays = useRef<string[] | null>(null);


    // first render and cleanup
    useEffect(() => {
        loadTest();
        pool.current = new nostr.SimplePool();
        relays.current = ['ws://localhost:8008'];
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

    // listen for event creation after published
    useEffect( () => {
        if (isPublished && id != "" && pool.current && relays.current)
        {
            console.log(`Geting event ${id} ...`);
            pool.current.get(relays.current, {
                ids: [id]
            }).then( (event: nostr.Event | null) => {
                if (event)
                {
                    console.log(`event found: {event}`);
                    setCreatedAt(event.created_at);
                }
            });
        }
    }, [isPublished, id]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value,
        }));
    ;

    
    const loadTest = () =>
    {
        setFormData((prevState) => ({
            ...prevState,
            uniqueName: "",
            name: "",
            description: "",
            image: `${getBaseUrl(window.location.href)}/images/add.svg`,
            imageDimensions: "",
            thumb: "",
            thumbDimensions: ""
        }));
    }

    const testEvent = () =>
    {
        let newEvent = {
            kind: 1,
            pubkey: '43094d0a6b72dd5b294e6ac3abcf4740a1867449330976b0394888cf1bda3819',
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: 'hello world',
            id: '',
            sig: ''
          }
          newEvent.id = nostr.getEventHash(newEvent)
          newEvent.sig = nostr.signEvent(newEvent, 'c58964e1825506d43cff78558d4cd1ac784d7b44da07ce5cb5eac498ba821062')

        const testPool = new nostr.SimplePool()
        let testRelays = ['ws://localhost:8008']
        testPool.ensureRelay('ws://localhost:8008').then ((relay) => {
          let pub = relay.publish(newEvent);
          pub.on('ok', () => {
            console.log('test event accepted');
        })
          
        });
    }

    const createEvent = async () =>
    {
        let nEvent: nostr.Event = {
            kind: 30009,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["d", uniqueName],
                ["name", name],
                ["description", description],
                ["image", image, imageDimensions],
                ["thumb", thumb, thumbDimensions]
            ],
            content: "",
            pubkey: publicKey,
            id: "",
            sig: ""
        }
    
        nEvent.id = nostr.getEventHash(nEvent)
        nEvent.sig = nostr.signEvent(nEvent, privateKey)
        
        let ok = nostr.validateEvent(nEvent)
        let veryOk = nostr.verifySignature(nEvent)

        console.log(`About to publish ${nEvent.id}`);

        if (pool.current && relays.current)
        {
            console.log('waiting for ensureRelay of first relay');
            await pool.current.ensureRelay(relays.current[0]);

            let pub = pool.current!.publish(relays.current!,
                nEvent);

            pub.on('ok', () => {
                console.log(`At least one relay has accepted our event`);
                setIsPublished(true);
            });

            pub.on('failed', (reason: any) => {
                console.log(`failed to publish to event: ${reason}`)
            });
        }
    }

    return (
        <Box  display='flex' flexDirection='column' alignItems='center'>
            <Grid container spacing={1} maxWidth='md'>
                {id != "" && 
                <>
                <Grid item xs={12}>
                    <TextField
                        id="id"
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
                    <Typography variant='h6'>Relays / Key</Typography>
                </Grid>
            </Grid>
           
            <Button onClick={testEvent}>Test Event</Button>
            <Button onClick={createEvent}>Create Event</Button>
            
            <ImageSelect
                selectedValue={selectedValue}
                open={open}
                onClose={handleClose}
            />
        </Box>  
    )
}
