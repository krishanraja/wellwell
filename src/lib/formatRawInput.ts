/**
 * Parses raw_input from events table and formats it for user display.
 * Handles both plain text and JSON-stringified objects from various tools.
 */

// Words to exclude from pattern analysis (JSON keys and common stop words)
const EXCLUDED_WORDS = new Set([
  // JSON keys from various tools
  'controlled', 'escaped', 'tomorrow', 'trigger', 'intensity', 'situation',
  'decision', 'option1', 'option2', 'context', 'reflection', 'response',
  // Common stop words
  'about', 'their', 'there', 'would', 'could', 'should', 'being', 'these',
  'those', 'which', 'after', 'before', 'other', 'because', 'through',
]);

interface ParsedInput {
  displayText: string;
  isJson: boolean;
  fields: Record<string, string>;
}

/**
 * Parse raw input and extract meaningful text for display
 */
export function parseRawInput(rawInput: string): ParsedInput {
  if (!rawInput) {
    return { displayText: '', isJson: false, fields: {} };
  }

  try {
    const parsed = JSON.parse(rawInput);
    
    if (typeof parsed === 'object' && parsed !== null) {
      const fields: Record<string, string> = {};
      const meaningfulParts: string[] = [];

      // Extract known fields with user-friendly labels
      const fieldMappings: Record<string, string> = {
        trigger: 'What triggered this',
        situation: 'Situation',
        intensity: 'Intensity',
        controlled: 'What I controlled',
        escaped: 'What escaped me',
        tomorrow: 'Tomorrow I will',
        decision: 'Decision',
        option1: 'Option 1',
        option2: 'Option 2',
        context: 'Context',
        reflection: 'Reflection',
        challenge: 'Challenge',
        response: 'Response',
      };

      for (const [key, label] of Object.entries(fieldMappings)) {
        if (parsed[key] && typeof parsed[key] === 'string' && parsed[key].trim()) {
          fields[key] = parsed[key];
          meaningfulParts.push(parsed[key]);
        } else if (parsed[key] && typeof parsed[key] === 'number') {
          fields[key] = String(parsed[key]);
        }
      }

      // If we found meaningful parts, join them
      if (meaningfulParts.length > 0) {
        return {
          displayText: meaningfulParts.join(' • '),
          isJson: true,
          fields,
        };
      }

      // Fallback: try to extract any string values
      const stringValues = Object.values(parsed)
        .filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
      
      if (stringValues.length > 0) {
        return {
          displayText: stringValues.join(' • '),
          isJson: true,
          fields,
        };
      }
    }
  } catch {
    // Not JSON, return as-is
  }

  return { displayText: rawInput, isJson: false, fields: {} };
}

/**
 * Get display text from raw input (simple version for UI)
 */
export function formatRawInputForDisplay(rawInput: string): string {
  return parseRawInput(rawInput).displayText;
}

/**
 * Extract words for pattern analysis, filtering out JSON keys
 */
export function extractWordsForAnalysis(rawInput: string): string[] {
  const { displayText } = parseRawInput(rawInput);
  
  return displayText
    .toLowerCase()
    .split(/\s+/)
    .filter(word => {
      // Must be at least 4 characters
      if (word.length < 5) return false;
      // Must not be an excluded word
      if (EXCLUDED_WORDS.has(word)) return false;
      // Must not look like a JSON artifact
      if (word.startsWith('"') || word.endsWith('"')) return false;
      if (word.includes(':') || word.includes('{') || word.includes('}')) return false;
      return true;
    });
}

/**
 * Format for cross-session memory display (more detailed)
 */
export function formatForMemoryContext(rawInput: string, toolName: string): string {
  const { displayText, isJson, fields } = parseRawInput(rawInput);
  
  if (!isJson) {
    return displayText;
  }

  // Tool-specific formatting
  switch (toolName) {
    case 'intervene':
      if (fields.trigger) {
        return fields.trigger;
      }
      break;
    case 'debrief':
      const parts: string[] = [];
      if (fields.controlled) parts.push(`Controlled: ${fields.controlled}`);
      if (fields.escaped) parts.push(`Escaped: ${fields.escaped}`);
      if (fields.tomorrow) parts.push(`Tomorrow: ${fields.tomorrow}`);
      if (parts.length > 0) return parts.join(' • ');
      break;
    case 'pulse':
      return displayText;
    case 'decision':
      if (fields.decision) return fields.decision;
      break;
    case 'conflict':
      if (fields.situation) return fields.situation;
      break;
  }

  return displayText;
}
