import { ContentSection } from '../types';

/**
 * Parses streamed markdown text that may contain structured tags like <guideline>, <drug>, etc.
 * Handles partial tags during streaming and converts them into ContentSection objects.
 */
export class MarkdownParser {
  private buffer: string = '';
  private sections: ContentSection[] = [];

  /**
   * Adds new text chunk to the buffer and parses it incrementally
   */
  addChunk(chunk: string): ContentSection[] {
    this.buffer += chunk;
    return this.parse();
  }

  /**
   * Parse the current buffer into content sections
   * Handles both tagged content (<tag>content</tag>) and plain text
   */
  private parse(): ContentSection[] {
    const sections: ContentSection[] = [];
    const text = this.buffer;
    let position = 0;

    // Look for complete tags: <tag>content</tag>
    const tagRegex = /<(\w+)>([\s\S]*?)<\/\1>/g;
    let match;
    const matches: Array<{ start: number; end: number; tagName: string; content: string }> = [];

    // Find all complete tags
    while ((match = tagRegex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        tagName: match[1],
        content: match[2],
      });
    }

    // Reset section counter for consistent IDs
    let sectionId = 0;

    // Process text and tags in order
    matches.forEach((tagMatch) => {
      // Add any text before this tag
      if (tagMatch.start > position) {
        const plainText = text.substring(position, tagMatch.start).trim();
        if (plainText) {
          sections.push({
            type: 'text',
            content: plainText,
            id: `section-${sectionId++}`,
          });
        }
      }

      // Add the tagged content
      sections.push({
        type: this.getTagType(tagMatch.tagName),
        content: tagMatch.content.trim(),
        tagName: tagMatch.tagName,
        id: `section-${sectionId++}`,
      });

      position = tagMatch.end;
    });

    // Add any remaining text after the last tag
    if (position < text.length) {
      const remaining = text.substring(position).trim();
      // Don't add if it looks like an incomplete tag
      if (remaining && !remaining.match(/<\w+>[\s\S]*$/)) {
        sections.push({
          type: 'text',
          content: remaining,
          id: `section-${sectionId++}`,
        });
      }
    }

    this.sections = sections;
    return sections;
  }

  /**
   * Determines the section type based on tag name
   */
  private getTagType(tagName: string): ContentSection['type'] {
    const normalizedTag = tagName.toLowerCase();

    if (normalizedTag === 'guideline') return 'guideline';
    if (normalizedTag === 'drug') return 'drug';
    return 'other';
  }

  /**
   * Get all current sections
   */
  getSections(): ContentSection[] {
    return this.sections;
  }

  /**
   * Reset the parser state
   */
  reset(): void {
    this.buffer = '';
    this.sections = [];
  }

  /**
   * Finalize parsing when stream is complete
   */
  finalize(): ContentSection[] {
    return this.parse();
  }
}

/**
 * Helper function to get a title for a tag name
 */
export function getTagTitle(tagName: string): string {
  const titles: Record<string, string> = {
    guideline: 'Guideline',
    drug: 'Drug Information',
  };

  return titles[tagName.toLowerCase()] || tagName.charAt(0).toUpperCase() + tagName.slice(1);
}
