// Cache for loaded schemas
const schemaCache = new Map<string, any>();

// Synchronous schema loader for GS1 library
export function getJsonSchema(schemaId: string): Buffer {
  
  // Check cache first
  if (schemaCache.has(schemaId)) {
    const schema = schemaCache.get(schemaId);
    const jsonString = JSON.stringify(schema);
    return Buffer.from(jsonString);
  }
  
  console.warn(`Schema not found in cache: ${schemaId}`);
  return Buffer.from(''); // Return empty buffer for unknown schemas
}

// Async function to download and cache schemas (for initial setup)
export async function downloadAndCacheSchemas(): Promise<void> {
  const schemas = [
    'https://id.gs1.org/vc/schema/v1/key.json',
    'https://id.gs1.org/vc/schema/v1/companyprefix.json',
    'https://id.gs1.org/vc/schema/v1/prefix.json',
    'https://id.gs1.org/vc/schema/v1/productdata.json',
    'https://id.gs1.org/vc/schema/v1/organizationdata.json'
  ];

  for (const schemaUrl of schemas) {
    try {
      if (!schemaCache.has(schemaUrl)) {
        const response = await fetch(schemaUrl);
        if (response.ok) {
          const schema = await response.json();
          schemaCache.set(schemaUrl, schema);
          // Also cache without .json extension
          const urlWithoutExtension = schemaUrl.replace('.json', '');
          schemaCache.set(urlWithoutExtension, schema);
        }
      }
    } catch (error) {
      console.error(`Failed to download schema ${schemaUrl}:`, error);
    }
  }
}