import { Event, getEventHash } from 'nostr-tools';
import { BadgeDefinition } from './BadgeInterfaces'

export const createBadgeEvent = (fields: BadgeDefinition) => {
    const {publicKey, uniqueName, name, description, image, imageDimensions, thumb, thumbDimensions} = fields;
    let event: Event = {
        kind: 30009,
        pubkey: "",
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: "",
        id: "",
        sig: ""
    }

    if (publicKey) event.pubkey = publicKey;

    // tags
    if (uniqueName) event.tags.push(["d", uniqueName]);
    if (name) event.tags.push(["name", name]);
    if (description) event.tags.push(["description", description]);
    if (image)
    {
        if (imageDimensions) event.tags.push(["image", image, imageDimensions])
        else event.tags.push(["image", image])
    }
    if (thumb)
    {
        if (thumbDimensions) event.tags.push(["thumb", thumb, thumbDimensions])
        else event.tags.push(["thumb", thumb])
    }   

    // must be last
    event.id = getEventHash(event)
    
    return event;
}
