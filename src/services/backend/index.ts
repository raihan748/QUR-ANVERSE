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

// 3. Compiler & Quran Virtual Machine (QVM)
export * from './compiler/QVMBytecodeEngine';
export * from './compiler/EarleyQuranParser';

// 4. Rule Pipeline & Special Handlers
export * from './rules/TajwidPipelineEngine';
export * from './rules/GharibSpecialRecitationHandler';

// 5. Acoustic DSP, MFCC & HMM/Viterbi Trellis
export * from './dsp/AcousticPhoneticAlignmentEngine';
export * from './dsp/MFCCFeatureExtractor';
export * from './dsp/ViterbiTrellisDecoder';

// 6. Semantic Vector Tensor & Graph Centrality
export * from './semantic/QuranicVectorTensorEngine';
export * from './semantic/GraphTopologyCentrality';

// 7. Zero-Knowledge Cryptography & BFT Consensus
export * from './crypto/ZeroKnowledgeProofEngine';
export * from './crypto/BFTStateSynchronizer';

// 8. Comparative Qira'at & Sanad Transmission DAG
export * from './qiraat/QiraatComparativeEngine';
export * from './qiraat/MultiQiraatASTDiffEngine';
export * from './qiraat/SanadTransmissionDAG';

// 9. Cognitive & Neuro-Spaced Repetition
export * from './memory/SuperMemoQuranicEngine';
export * from './memory/NeuroSpacedRepetitionEngine';

// 10. Advanced Quranic Research Engines (Chronological, I'rab, Hadith, Multilingual, Asmaul Husna)
export * from './research';

// 11. Gateway Facade
export * from './gateway/EnterpriseBackendFacade';

// 12. Compatibility Services
export * from './tajwidRuleEngine';
export * from './quranKnowledgeGraph';
export * from './cryptographicAuditLedger';
export * from './makhrajAcousticEngine';
export * from './spacedRepetitionEngine';
export * from './bayesianKnowledgeEngine';
export * from './celestialAstronomyEngine';
export * from './resilienceGateway';
