import Badge from "./components/Badge";
import * as nostr from 'nostr-tools';

const Test = () =>
{
    const pubkey = '43094d0a6b72dd5b294e6ac3abcf4740a1867449330976b0394888cf1bda3819';
    const npub = nostr.nip19.npubEncode(pubkey);

    return (
        <>
            {npub}
        </>
    )
}

export default Test;