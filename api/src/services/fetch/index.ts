
const HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
}

export async function fetch_get(url: string): Promise<Response> {

    return await fetch(url, { method: 'GET', headers: HEADERS});
    
}