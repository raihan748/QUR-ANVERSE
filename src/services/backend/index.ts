// ==============================================================================
// ENTERPRISE QURANVERSE BACKEND ARCHITECTURE
// Clean Domain-Driven Layered Framework Index
// ==============================================================================

// 1. Core Kernel & Domain
export * from './core/QuranicExecutionContext';
export * from './core/QuranicPhonemeRegistry';
export * from './core/QuranicChecksumIntegrity';

// 2. Lexer & Abstract Syntax Tree (AST) Grammar
export * from './ast/ArabicUnicodeLexer';
export * from './ast/TajwidASTGrammarParser';

// 3. Rule Pipeline & Special Handlers
export * from './rules/TajwidPipelineEngine';
export * from './rules/GharibSpecialRecitationHandler';

// 4. Comparative Qira'at Engine
export * from './qiraat/QiraatComparativeEngine';

// 5. Acoustic DSP & Dynamic Time Warping (DTW)
export * from './dsp/AcousticPhoneticAlignmentEngine';

// 6. Cognitive Spaced Repetition (SuperMemo SM-2)
export * from './memory/SuperMemoQuranicEngine';

// 7. Gateway Facade
export * from './gateway/EnterpriseBackendFacade';

// 8. Legacy & Compatible Engines
export * from './tajwidRuleEngine';
export * from './quranKnowledgeGraph';
export * from './cryptographicAuditLedger';
export * from './makhrajAcousticEngine';
export * from './spacedRepetitionEngine';
export * from './bayesianKnowledgeEngine';
export * from './celestialAstronomyEngine';
export * from './resilienceGateway';
