import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch"; 

interface WhimsicalResponse {
  fileURL: string;
  imageURL: string;
}

// Create an MCP server
const server = new McpServer({
  name: "Whimsical Diagram Generator",
  version: "1.0.0"
});


/**
 * Get base64 encoded image
 * 
 * @param imageUrl URL to the image we wish to convert to base64
 * @returns Details of the image, including the base64 encoded image and the mime type
 */
export async function getBase64Image(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();
  const mimeType = response.headers.get('content-type') || 'image/png';
  return {
    data: Buffer.from(buffer).toString('base64'),
    mimeType
  };
}

/**
 * Creates a new Whimsical diagram
 * 
 * @param mermaid_markup The mermaid markup for the diagram
 * @param title The title of the Whimsical diagram
 * 
 * @returns [
 *  The url of the Whimsical diagram,
 *  The base64 encoded image of the Whimsical diagram
 * ]
 */
server.tool("create_whimsical_diagram", 
  {
    mermaid_markup: z.string().describe("The mermaid markup for the diagram"),
    title: z.string().describe("The title of the Whimsical diagram") },
    async ({ mermaid_markup, title }) => {      
      const response = await fetch("https://whimsical.com/api/ai.chatgpt.render-flowchart", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mermaid: mermaid_markup,
          title
        })
      });
            
      const responseData = await response.json() as WhimsicalResponse;
      
      // Get base64 encoded image
      const { data, mimeType } = await getBase64Image(responseData.imageURL);
      
      return {
        content: [
          { type: "text", text: responseData.fileURL },
          {
            type: "image",
            data,
            mimeType
          },
          { 
            type: "resource",
            resource: {
              uri: responseData.fileURL,
              text: "Whimsical Link"
            }
          }
        ]
      };
  });

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);