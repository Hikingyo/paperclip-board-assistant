/**
 * Fluent markdown builder for type-safe markdown generation
 * Replaces string concatenation patterns
 */

export class MarkdownBuilder {
  private lines: string[] = [];

  /**
   * Add a heading
   */
  heading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string): this {
    this.lines.push(`${"#".repeat(level)} ${text}`);
    this.blankLine();
    return this;
  }

  /**
   * Add a paragraph of text
   */
  paragraph(text: string): this {
    this.lines.push(text);
    this.blankLine();
    return this;
  }

  /**
   * Add a field (name: value) pair
   */
  field(name: string, value: string | number | boolean | null | undefined): this {
    if (value === null || value === undefined) {
      return this;
    }
    this.lines.push(`**${name}**: ${value}`);
    return this;
  }

  /**
   * Add an unordered list
   */
  list(items: string[]): this {
    if (items.length === 0) {
      return this;
    }
    items.forEach((item) => {
      this.lines.push(`- ${item}`);
    });
    this.blankLine();
    return this;
  }

  /**
   * Add an ordered list
   */
  orderedList(items: string[]): this {
    if (items.length === 0) {
      return this;
    }
    items.forEach((item, index) => {
      this.lines.push(`${index + 1}. ${item}`);
    });
    this.blankLine();
    return this;
  }

  /**
   * Add a code block
   */
  codeBlock(code: string, language = "typescript"): this {
    this.lines.push(`\`\`\`${language}`);
    this.lines.push(code);
    this.lines.push("```");
    this.blankLine();
    return this;
  }

  /**
   * Add inline code
   */
  inline(text: string): string {
    return `\`${text}\``;
  }

  /**
   * Add bold text
   */
  bold(text: string): string {
    return `**${text}**`;
  }

  /**
   * Add italic text
   */
  italic(text: string): string {
    return `*${text}*`;
  }

  /**
   * Add a horizontal rule
   */
  divider(): this {
    this.lines.push("---");
    this.blankLine();
    return this;
  }

  /**
   * Add a table (simple two-column format)
   */
  table(rows: Array<[string, string]>): this {
    if (rows.length === 0) {
      return this;
    }

    const firstRow = rows[0];
    if (!firstRow) {
      return this;
    }

    // Header
    this.lines.push(`| ${firstRow[0]} | ${firstRow[1]} |`);
    this.lines.push("|---|---|");

    // Rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row) {
        this.lines.push(`| ${row[0]} | ${row[1]} |`);
      }
    }
    this.blankLine();
    return this;
  }

  /**
   * Add a blockquote
   */
  quote(text: string): this {
    const lines = text.split("\n");
    lines.forEach((line) => {
      this.lines.push(`> ${line}`);
    });
    this.blankLine();
    return this;
  }

  /**
   * Add a blank line
   */
  blankLine(): this {
    if (this.lines.length > 0 && this.lines[this.lines.length - 1] !== "") {
      this.lines.push("");
    }
    return this;
  }

  /**
   * Raw line append
   */
  raw(line: string): this {
    this.lines.push(line);
    return this;
  }

  /**
   * Build and return the markdown string
   */
  build(): string {
    return this.lines
      .filter((line) => line !== undefined)
      .join("\n")
      .trimEnd();
  }

  /**
   * Get the length of built markdown
   */
  length(): number {
    return this.build().length;
  }

  /**
   * Clear all content
   */
  clear(): this {
    this.lines = [];
    return this;
  }

  /**
   * Get current content as array of lines
   */
  lines_(): string[] {
    return [...this.lines];
  }
}

/**
 * Helper to create a new builder
 */
export function markdown(): MarkdownBuilder {
  return new MarkdownBuilder();
}
