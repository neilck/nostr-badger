import { Box, TextField, StandardTextFieldProps } from '@mui/material';
import { getRelayContext } from '../RelayContext';

const Relay = (props: StandardTextFieldProps) => {
    const url = getRelayContext().relay;
    const setRelay = getRelayContext().setRelay;

    const updateRelay = (url: string) => {
        setRelay(url);
    }

    return (
        <>
            <Box display="flex" alignItems='end'>
            Relay &nbsp;&nbsp;
            <Box sx={{ width: '400px', backgroundColor: 'grey.200', pl: 1}}>
             <TextField id="standard-basic" variant="standard" fullWidth
             defaultValue={url} onChange={ (event) => { updateRelay(event.target.value) }} {...props} />
            </Box>
            </Box>
        </>
    )
}

export default Relay;