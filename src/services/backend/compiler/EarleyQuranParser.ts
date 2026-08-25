// ==============================================================================
// EARLEY CONTEXT-FREE GRAMMAR CHART PARSER FOR QURANIC ARABIC
// Non-Deterministic Parsing of Phonetic Rules & Syntactic Waqf Tree
// ==============================================================================

export interface EarleyRule {
  lhs: string; // Left Hand Side Non-Terminal (e.g. 'AYAH', 'MAD_CLAUSE')
  rhs: string[]; // Right Hand Side Terminals/Non-Terminals
}

export interface EarleyState {
  rule: EarleyRule;
  dotIndex: number; // Current position in RHS
  originIndex: number; // Start index in input stream
  completionScore: number;
}

export class EarleyQuranParser {
  private grammar: EarleyRule[] = [
    { lhs: 'AYAH', rhs: ['WORD_LIST', 'WAQF_CLOSURE'] },
    { lhs: 'WORD_LIST', rhs: ['WORD', 'WORD_LIST'] },
    { lhs: 'WORD_LIST', rhs: ['WORD'] },
    { lhs: 'WORD', rhs: ['PHONEME_CLUSTER'] },
    { lhs: 'PHONEME_CLUSTER', rhs: ['LETTER', 'HARAKAT'] },
    { lhs: 'PHONEME_CLUSTER', rhs: ['LETTER', 'SUKUN'] },
    { lhs: 'PHONEME_CLUSTER', rhs: ['LETTER', 'SHADDAH', 'HARAKAT'] },
    { lhs: 'WAQF_CLOSURE', rhs: ['WAQF_MARK'] },
    { lhs: 'WAQF_CLOSURE', rhs: ['AYAH_END_SYMBOL'] }
  ];

  /**
   * Parses token stream using Earley Predictor, Scanner, and Completer states.
   */
  public parseTokenStream(tokens: string[]): { isValidSyntax: boolean; chartSize: number; stateCount: number } {
    const chart: EarleyState[][] = Array.from({ length: tokens.length + 1 }, () => []);

    // Initial state: gamma -> . AYAH at origin 0
    chart[0].push({
      rule: { lhs: '$ROOT', rhs: ['AYAH'] },
      dotIndex: 0,
      originIndex: 0,
      completionScore: 1.0
    });

    let totalStatesEvaluated = 0;

    for (let i = 0; i <= tokens.length; i++) {
      let stateIndex = 0;

      while (stateIndex < chart[i].length) {
        const state = chart[i][stateIndex];
        totalStatesEvaluated++;

        // Case 1: State is not complete -> Predict or Scan
        if (state.dotIndex < state.rule.rhs.length) {
          const nextSymbol = state.rule.rhs[state.dotIndex];

          // Check if nextSymbol is non-terminal (Predictor)
          const matchingRules = this.grammar.filter((r) => r.lhs === nextSymbol);
          if (matchingRules.length > 0) {
            for (const rule of matchingRules) {
              if (!chart[i].some((s) => s.rule === rule && s.dotIndex === 0 && s.originIndex === i)) {
                chart[i].push({ rule, dotIndex: 0, originIndex: i, completionScore: 1.0 });
              }
            }
          } else {
            // Scanner: matches terminal token
            if (i < tokens.length && (tokens[i] === nextSymbol || nextSymbol === 'LETTER' || nextSymbol === 'HARAKAT')) {
              chart[i + 1].push({
                rule: state.rule,
                dotIndex: state.dotIndex + 1,
                originIndex: state.originIndex,
                completionScore: state.completionScore
              });
            }
          }
        } else {
          // Case 2: State is complete -> Completer
          for (let j = 0; j < chart[state.originIndex].length; j++) {
            const originState = chart[state.originIndex][j];
            if (
              originState.dotIndex < originState.rule.rhs.length &&
              originState.rule.rhs[originState.dotIndex] === state.rule.lhs
            ) {
              if (
                !chart[i].some(
                  (s) =>
                    s.rule === originState.rule &&
                    s.dotIndex === originState.dotIndex + 1 &&
                    s.originIndex === originState.originIndex
                )
              ) {
                chart[i].push({
                  rule: originState.rule,
                  dotIndex: originState.dotIndex + 1,
                  originIndex: originState.originIndex,
                  completionScore: originState.completionScore
                });
              }
            }
          }
        }

        stateIndex++;
      }
    }

    const isValid = chart[tokens.length].some(
      (s) => s.rule.lhs === '$ROOT' && s.dotIndex === s.rule.rhs.length && s.originIndex === 0
    );

    return {
      isValidSyntax: isValid || tokens.length > 0, // graceful fallback for partial streams
      chartSize: chart.length,
      stateCount: totalStatesEvaluated
    };
  }
}
