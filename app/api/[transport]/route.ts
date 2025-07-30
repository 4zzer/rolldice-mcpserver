// app/api/[transport]/route.ts
import { createMcpHandler } from "mcp-handler";
import { rollDice, rollDiceTool } from "@/lib/dice";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      rollDiceTool.name,
      rollDiceTool.description,
      rollDiceTool.schema,
      async ({ sides }) => {
        // Use the shared dice rolling logic
        const result = rollDice(sides);
        return {
          content: [result],
        };
      }
    );
  },
  {
    // Optional server options
  },
  {
    // No Redis config - disable Redis requirement
    basePath: "/api", // this needs to match where the [transport] is located.
    maxDuration: 60,
    verboseLogs: true,
  }
);
export { handler as GET, handler as POST };