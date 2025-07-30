import { z } from "zod"

// Shared Zod schema for dice sides validation
export const diceSchema = z.number().int().min(2)

// Shared dice rolling logic used by both MCP handler and server actions
export function rollDice(sides: number) {
  // Validate input using the shared schema
  const validatedSides = diceSchema.parse(sides)
  
  // Generate random number (same algorithm everywhere)
  const value = 1 + Math.floor(Math.random() * validatedSides)
  
  // Return standardized result format
  return {
    type: 'text' as const,
    text: `🎲 You rolled a ${value}!`
  }
}

// Tool definition that can be reused
export const rollDiceTool = {
  name: 'roll_dice',
  description: 'Rolls an N-sided die',
  schema: {
    sides: diceSchema,
  }
} as const
