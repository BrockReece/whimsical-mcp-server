import fetch from "node-fetch"; 

// Function to get base64 encoded image
export async function getBase64Image(imageUrl: string): Promise<{ data: string; mimeType: string }> {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') || 'image/png';
    return {
      data: Buffer.from(buffer).toString('base64'),
      mimeType
    };
  }