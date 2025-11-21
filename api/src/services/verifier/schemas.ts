import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cache for loaded schemas
const schemaCache = new Map<string, any>();

// Schema mapping: URL to local filename
const schemaMapping: Record<string, string> = {
  'https://id.gs1.org/vc/schema/v1/key': 'gs1-key-schema.json',
  'https://id.gs1.org/vc/schema/v1/companyprefix': 'gs1-company-prefix-schema.json',
  'https://id.gs1.org/vc/schema/v1/prefix': 'gs1-prefix-schema.json',
  'https://id.gs1.org/vc/schema/v1/productdata': 'gs1-product-data-schema.json',
  'https://id.gs1.org/vc/schema/v1/organizationdata': 'gs1-organization-data-schema.json'
};

// Synchronous schema loader for GS1 library
export function getJsonSchema(schemaId: string): Uint8Array {
  
  // Check cache first
  if (schemaCache.has(schemaId)) {
    const schema = schemaCache.get(schemaId);
    const jsonString = JSON.stringify(schema);
    return new Uint8Array(Buffer.from(jsonString));
  }
  
  console.warn(`Schema not found in cache: ${schemaId}`);
  return new Uint8Array(0); // Return empty Uint8Array for unknown schemas
}

// Load schemas from local files (synchronous for initial setup)
export function loadLocalSchemas(): void {
  for (const [schemaUrl, filename] of Object.entries(schemaMapping)) {
    try {
      if (!schemaCache.has(schemaUrl)) {
        const schemaPath = join(__dirname, 'schemas', filename);
        const schemaContent = readFileSync(schemaPath, 'utf-8');
        const schema = JSON.parse(schemaContent);
        schemaCache.set(schemaUrl, schema);
      }
    } catch (error) {
      console.error(`Failed to load local schema ${filename}:`, error);
    }
  }
}

// Async wrapper for compatibility (now just calls the sync version)
export async function downloadAndCacheSchemas(): Promise<void> {
  loadLocalSchemas();
}