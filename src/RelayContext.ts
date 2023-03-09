import React, { useContext } from 'react';

// used to pass relay URLs to components 
export interface RelayContextInterface {
    relays: string[],
    setRelays: React.Dispatch<React.SetStateAction<string[]>>; 
  }

export const RelayContext = React.createContext<RelayContextInterface | null>(null);

export const getRelayContext = () => {
    const context = useContext(RelayContext);
    if (!context) {
        throw new Error ("getRelayContext has be to used withing <RelayContext.Prover>");
    }

    return context;
}