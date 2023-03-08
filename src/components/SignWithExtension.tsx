import { Box, Button, ButtonProps, Link, Typography, Container } from '@mui/material';
import React, { useEffect, useState, useRef } from 'react';
import { Event } from 'nostr-tools';

interface SignWithExtensionProps extends ButtonProps {
    name: string,
}

export function SignWithExtension({name, disabled, ...rest}: SignWithExtensionProps)
{
    const [hasProvider, setHasProvider] = useState(false);
    const [checkRun, setCheckRun] = useState(false);

    useEffect(() => {
        setTimeout(checkWindowNostr, 200);
        
    }, []);

    const checkWindowNostr = () => {
        if ((window as any).nostr ) setHasProvider(true);
        setCheckRun(true);
    }

    const renderButton = () => {
        if (!checkRun)
            return <></>

        if (hasProvider)
            return <Button {...rest}>{name}</Button>
        else
            return ( 
                <Box 
                    m={1}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Button disabled {...rest}>{name}</Button>
                    
                    <Box mt={1}>
                        <Typography>Requires browser extension to sign and send event.</Typography>
                
                        <Link href="https://getalby.com/">Alby Extension</Link>&nbsp;&nbsp;
                        <Link href="https://github.com/fiatjaf/nos2x">nos2x</Link>  
                    </Box>

                </Box>
            )
    }

    return (
        <>
            {renderButton()}
        </>
    )
}