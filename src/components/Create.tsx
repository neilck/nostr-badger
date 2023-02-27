import { Typography } from '@mui/material';
import { useState, Component } from 'react';

type CreateProps = {
   eventId?: string 
}

type CreateState={
    d: string,
    name: string,
    description: string,
    image: string,
    imageSize: string,
    thumb: string,
    thumbSize: string
}

class Create extends Component<CreateProps, CreateState> {
    state: CreateState = {
        d: "", name: "", description: "", image: "", imageSize: "", thumb: "", thumbSize: "" 
    };

    componentDidMount() {
        this.setState((state) => ({ d: "bravery", name: "Medal of Bravery", description: "Awarded to users demonstrating bravery", image: "https://nostr.academy/awards/bravery.png"}));
    }

    render() {
        return <div className="Create">
        <Typography>{this.state.name}</Typography>
        <Typography>{this.state.description}</Typography>
        <Typography>{this.state.image}</Typography>
        <Typography>{this.state.thumb}</Typography>
    </div>;
    }
}

export default Create;
