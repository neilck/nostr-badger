import { Typography, IconButton, Card, CardMedia, Box, Link } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as ReactLink } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Event, nip19, relayInit } from 'nostr-tools';

import { SignWithExtension } from './SignWithExtension';

interface BadgeProps {
    event: Event
    onDelete?: (event: Event) => void 
}

export default function Badge( props: BadgeProps )
{
    const raw = JSON.stringify(props.event, null, 2);
    const { id, kind, tags, content, created_at, pubkey, sig } = props.event;
    let uniqueName = "";
    let name = "";
    let description = "";
    let image = "";
    let imageDimensions = "";
    let thumb = "";
    let thumbDimensions = "";
    
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
    const npub = nip19.npubEncode(pubkey);
    const ndLink = `https://nostr.directory/p/${npub}`;
    const bpLink = `https://badges.page/p/${pubkey}`;

    const [showCode, setShowCode] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>
        ) => {
        if (props.onDelete)
            props.onDelete(props.event);
    }
    
    return (
        <Card sx={{ display: 'flex', flexDirection: 'column', border: 1, borderColor: 'grey.200', backgroundColor: 'grey.200'}} >
            <Box sx={{ display: 'flex', width: 1}}>       
                <Box padding={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <CardMedia
                                component="img"
                                sx={{
                                    height: "60px",
                                    width: "60px"
                                }}
                                image={image}
                                alt="badge image"
                    />
                </Box>
                <Box sx={{ width: 1, padding: 1 }}>
                    
                    <Typography variant="h6" >{name}</Typography>
                    <Typography>{description}</Typography>
                    <a target="_blank" href={bpLink}>badges.page</a>&nbsp;&nbsp;
                    <a target="_blank" href={ndLink}>nostr.directory</a>
                    
                </Box>
            </Box>
            <Box sx={{ display: 'flex', height: '30px', backgroundColor: 'white', width: 1, padding: 1, alignItems: 'center', justifyContent: 'space-between'}}>  
                <Box sx={{ width: '200px'}}>
                    <Typography variant='subtitle2'>{uniqueName}</Typography>  
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'right', width:1}}>
                    
                    <Box sx={{ width: '40px', height: '40px', padding: '8px'}}>
                        <ReactLink to="/create" state={{ fromBadge: props.event }}>
                            <EditIcon sx={{color: 'rgba(0,0,0,0.54)'}} />
                        </ReactLink>
                    </Box>
                    <IconButton aria-label="delete" onClick={ () => { setShowDelete( (prevState) => { return !prevState})}}>
                        <DeleteIcon />
                    </IconButton>
                    <IconButton aria-label="code" onClick={ () => { setShowCode( (prevState) => { return !prevState })}}>
                        <CodeIcon />
                    </IconButton>
                </Box>
            </Box>
            { showCode &&  
                <Box sx={{ margin: 1, padding: 1, backgroundColor: 'white' }}>
                    <pre>{raw}</pre>
                </Box>
            }
            { showDelete &&  
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width:1, padding: 1, backgroundColor: 'white' }}>
                    <SignWithExtension variant="contained" name="Delete Badge" onClick={ handleDeleteClick } />
                </Box>
            }
        </Card>
    )
}