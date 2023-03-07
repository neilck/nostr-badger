export interface BadgeDefinition {
    id?: string,
    publicKey?: string,
    uniqueName?: string,
    name?: string,
    description?: string,
    image?: string,
    imageDimensions?: string,
    thumb?: string,
    thumbDimensions?: string
}

export interface Recipient {
    pubkey: string,
    relay?: string

}
export interface BadgeAward {
    id: string,
    issuerPubkey: string,
    badgeReference: string, // e.g. 30009:alice.bravery
    recipients: Array<Recipient>
}

export interface DefinitionAwardPair {
    badgeReference: string,
    badgeAwardEventId: string,
    badgeAwardRelay: string

}
export interface ProfileBadge {
    id: string,
    profilePubkey: string,
    badges: Array<DefinitionAwardPair>
}
