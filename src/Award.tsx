import Badge from './components/Badge';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as nostr from 'nostr-tools';


const Award = () => {

    const [badge, setBadge] = useState<nostr.Event>();

   //  let badge: nostr.Event | null = null;
    // Handle data from Badge component's react router dom Link
    let state = useLocation().state;
    if (state && state.fromBadge)
    {
        setBadge(state.fromBadge);
        useLocation().state.fromBadge = undefined;
    }

    return (
        <>
        Issue
        { badge && <Badge event={badge}></Badge>}
        </>
    );
};

export default Award;