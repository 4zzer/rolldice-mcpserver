'use server'

import { rollDice as rollDiceCore, rollDiceTool } from "@/lib/dice"

// Server action that uses the shared dice rolling logic
export async function rollDice(sides: number) {
  try {
    const result = rollDiceCore(sides)
    
    return {
      success: true,
      result: {
        content: [result]
      }
    }
  } catch {
    return {
      success: false,
      error: {
        code: -32602,
        message: 'Invalid parameters: sides must be a number >= 2'
      }
    }
  }
}

export async function listTools() {
  return {
    success: true,
    result: {
      tools: [
        {
          name: rollDiceTool.name,
          description: rollDiceTool.description,
          inputSchema: {
            type: 'object',
            properties: {
              sides: {
                type: 'number',
                description: 'Number of sides on the die (minimum 2)',
                minimum: 2
              }
            },
            required: ['sides']
          }
        }
      ]
    }
  }
}
