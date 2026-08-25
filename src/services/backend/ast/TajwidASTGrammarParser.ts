// ==============================================================================
// TAJWID ABSTRACT SYNTAX TREE (AST) GRAMMAR PARSER
// Formal Language Theory for Quranic Recitation Rules
// ==============================================================================

import { ArabicUnicodeLexer, ArabicTokenType, LexerToken } from './ArabicUnicodeLexer';

export type ASTNodeType = 
  | 'AYAH_ROOT'
  | 'WORD_NODE'
  | 'PHONEME_CLUSTER'
  | 'TAJWID_RULE_NODE'
  | 'WAQF_MARK_NODE'
  | 'DIACRITIC_LEAF';

export interface ASTNode {
  id: string;
  type: ASTNodeType;
  value?: string;
  ruleCategory?: string;
  harakatBeats?: number;
  startOffset: number;
  endOffset: number;
  children: ASTNode[];
}

export class TajwidASTGrammarParser {
  private nodeCounter = 0;

  public parse(arabicText: string): ASTNode {
    const rawTokens = ArabicUnicodeLexer.tokenize(arabicText);
    this.nodeCounter = 0;

    const root: ASTNode = {
      id: `node_root_${this.getNextId()}`,
      type: 'AYAH_ROOT',
      startOffset: 0,
      endOffset: arabicText.length,
      children: []
    };

    let currentWordTokens: LexerToken[] = [];
    let wordStart = 0;

    for (let i = 0; i < rawTokens.length; i++) {
      const tok = rawTokens[i];

      if (tok.type === 'WHITESPACE') {
        if (currentWordTokens.length > 0) {
          root.children.push(this.buildWordNode(currentWordTokens, wordStart, tok.charOffset));
          currentWordTokens = [];
        }
        wordStart = tok.charOffset + 1;
      } else {
        currentWordTokens.push(tok);
      }
    }

    if (currentWordTokens.length > 0) {
      root.children.push(this.buildWordNode(currentWordTokens, wordStart, arabicText.length));
    }

    return root;
  }

  private buildWordNode(tokens: LexerToken[], start: number, end: number): ASTNode {
    const wordNode: ASTNode = {
      id: `node_word_${this.getNextId()}`,
      type: 'WORD_NODE',
      value: tokens.map((t) => t.value).join(''),
      startOffset: start,
      endOffset: end,
      children: []
    };

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const leaf: ASTNode = {
        id: `node_leaf_${this.getNextId()}`,
        type: t.type === 'WAQF_MARK' ? 'WAQF_MARK_NODE' : 'DIACRITIC_LEAF',
        value: t.value,
        startOffset: t.charOffset,
        endOffset: t.charOffset + t.length,
        children: []
      };
      wordNode.children.push(leaf);
    }

    return wordNode;
  }

  private getNextId(): number {
    return ++this.nodeCounter;
  }
}
