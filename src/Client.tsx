
export type Client = {
    identifier: number,
    address: string,
}

export type ClientConnectionPayload = {
    client: Client,
    tail: string,
    query: string,
    headers: Map<string, string[]>
}

export type ClientDisconnectionPayload = {
    client: Client,
    message: { code: number, reason: string } | null
}