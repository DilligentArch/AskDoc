import { Pinecone } from '@pinecone-database/pinecone';


if(!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY is not set in the environment variables');
}

const pineconeClient = new Pinecone({
  
  apiKey: process.env.PINECONE_API_KEY,
});
async function createIndex() {
  try {
    await pineconeClient.createIndex({
      name: 'chat-with-pdf',
      spec: {
        dimension: 1536,
        metric: 'cosine',
      },
    });
    console.log('✅ Index created successfully');
  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      console.log('ℹ️ Index already exists');
    } else {
      console.error('❌ Failed to create index:', err);
    }
  }
}

createIndex();