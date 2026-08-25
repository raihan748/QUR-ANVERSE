// ==============================================================================
// ENTERPRISE BACKEND FACADE & UNIFIED SERVICE GATEWAY
// Orchestration of AST, Rules, Knowledge Graph, Cryptography, and DSP
// ==============================================================================

import { executionContext } from '../core/QuranicExecutionContext';
import { checksumIntegrity } from '../core/QuranicChecksumIntegrity';
import { TajwidRuleEngine, tajwidEngine } from '../tajwidRuleEngine';
import { TajwidASTGrammarParser, ASTNode } from '../ast/TajwidASTGrammarParser';
import { GharibSpecialRecitationHandler } from '../rules/GharibSpecialRecitationHandler';
import { QiraatComparativeEngine } from '../qiraat/QiraatComparativeEngine';
import { AcousticPhoneticAlignmentEngine, SpectralFrame } from '../dsp/AcousticPhoneticAlignmentEngine';
import { SuperMemoQuranicEngine, SuperMemoState, ReviewGrade } from '../memory/SuperMemoQuranicEngine';
import { QVMBytecodeEngine, QVMInstruction, QVMFrameState } from '../compiler/QVMBytecodeEngine';
import { EarleyQuranParser } from '../compiler/EarleyQuranParser';
import { MFCCFeatureExtractor, MFCCVector } from '../dsp/MFCCFeatureExtractor';
import { ViterbiTrellisDecoder, HMMPhonemeState, ViterbiDecodingResult } from '../dsp/ViterbiTrellisDecoder';
import { QuranicVectorTensorEngine, AyatVectorEmbedding } from '../semantic/QuranicVectorTensorEngine';
import { GraphTopologyCentrality, GraphNode, GraphEdge } from '../semantic/GraphTopologyCentrality';
import { ZeroKnowledgeProofEngine, ZKPProofOfInclusion } from '../crypto/ZeroKnowledgeProofEngine';
import { BFTStateSynchronizer, PeerVote, ConsensusRoundResult } from '../crypto/BFTStateSynchronizer';
import { NeuroSpacedRepetitionEngine, DSRMemoryState } from '../memory/NeuroSpacedRepetitionEngine';
import { MultiQiraatASTDiffEngine, CanonicalImam, QiraatASTDiffResult } from '../qiraat/MultiQiraatASTDiffEngine';
import { SanadTransmissionDAG } from '../qiraat/SanadTransmissionDAG';
import { TajwidAnalysisResult } from '../../../types';

export class EnterpriseBackendFacade {
  private static instance: EnterpriseBackendFacade;
  private astParser = new TajwidASTGrammarParser();
  private qvmEngine = new QVMBytecodeEngine();
  private earleyParser = new EarleyQuranParser();
  private mfccExtractor = new MFCCFeatureExtractor();
  private bftSynchronizer = new BFTStateSynchronizer();

  private constructor() {}

  public static getInstance(): EnterpriseBackendFacade {
    if (!EnterpriseBackendFacade.instance) {
      EnterpriseBackendFacade.instance = new EnterpriseBackendFacade();
    }
    return EnterpriseBackendFacade.instance;
  }

  // --- COMPILER & QVM ---
  public compileAyahToQVM(arabicText: string): QVMInstruction[] {
    return this.qvmEngine.compileTextToBytecode(arabicText);
  }

  public executeQVM(program?: QVMInstruction[]): QVMFrameState {
    return this.qvmEngine.execute(program);
  }

  public parseEarleyGrammar(tokens: string[]) {
    return this.earleyParser.parseTokenStream(tokens);
  }

  // --- ACOUSTIC DSP & VITERBI ---
  public extractMFCC(pcmSamples: Float32Array, timestampMs: number): MFCCVector {
    return this.mfccExtractor.extractWindowMFCC(pcmSamples, timestampMs);
  }

  public decodeViterbi(frames: MFCCVector[], hmmStates: HMMPhonemeState[]): ViterbiDecodingResult {
    return ViterbiTrellisDecoder.decode(frames, hmmStates);
  }

  // --- SEMANTIC TENSOR & GRAPH ---
  public generateAyahVector(text: string, category: string): number[] {
    return QuranicVectorTensorEngine.generateVector(text, category);
  }

  public computeThematicSimilarity(v1: number[], v2: number[]): number {
    return QuranicVectorTensorEngine.computeCosineSimilarity(v1, v2);
  }

  public computeGraphCentrality(nodes: GraphNode[], edges: GraphEdge[]) {
    const pageRanks = GraphTopologyCentrality.computePageRank(nodes, edges);
    const communities = GraphTopologyCentrality.detectCommunities(nodes, edges);
    return { pageRanks, communities };
  }

  // --- ZERO-KNOWLEDGE PROOF & BFT ---
  public generateZKPInclusionProof(leafIndex: number, treeLayers: string[][]): ZKPProofOfInclusion {
    return ZeroKnowledgeProofEngine.generateInclusionProof(leafIndex, treeLayers);
  }

  public verifyZKPProof(leafHash: string, rootHash: string, proofPath: any[]): boolean {
    return ZeroKnowledgeProofEngine.verifyProof(leafHash, rootHash, proofPath);
  }

  public evaluateBFTConsensus(roundId: string, votes: PeerVote[]): ConsensusRoundResult {
    return this.bftSynchronizer.evaluateConsensus(roundId, votes);
  }

  // --- NEURO DSR SPACED REPETITION ---
  public calculateDSRRetrievability(state: DSRMemoryState, now?: number): number {
    return NeuroSpacedRepetitionEngine.calculateRetrievability(state, now);
  }

  public updateDSRState(state: DSRMemoryState, grade: 0 | 1 | 2 | 3 | 4 | 5, latencyMs?: number): DSRMemoryState {
    return NeuroSpacedRepetitionEngine.updateDSRState(state, grade, latencyMs);
  }

  // --- COMPARATIVE QIRA'AT & SANAD DAG ---
  public compareTenQiraat(surah: number, ayah: number, base?: CanonicalImam, compare?: CanonicalImam): QiraatASTDiffResult[] {
    return MultiQiraatASTDiffEngine.compareQiraat(surah, ayah, base, compare);
  }

  public getAuthenticHafshSanadLineage() {
    return SanadTransmissionDAG.getHafshLineagePath();
  }

  // --- CLASSIC TAJWID & PROFILING ---
  public async analyzeAyahProfiled(
    surahNumber: number,
    ayahNumber: number,
    rawArabic: string
  ): Promise<TajwidAnalysisResult> {
    return executionContext.runWithProfiling(
      `TajwidAnalysis:${surahNumber}:${ayahNumber}`,
      () => {
        return tajwidEngine.analyzeAyat(surahNumber, ayahNumber, rawArabic);
      },
      { surah: surahNumber, ayah: ayahNumber, textLength: rawArabic.length }
    );
  }

  public parseAyahToAST(arabicText: string): ASTNode {
    return this.astParser.parse(arabicText);
  }

  public verifyVerseSecurity(surah: number, ayah: number, rawArabic: string) {
    return checksumIntegrity.verifyVerseIntegrity(surah, ayah, rawArabic);
  }

  public evaluateMakhrajAcoustics(userFrames: SpectralFrame[], targetLetter: string) {
    return AcousticPhoneticAlignmentEngine.computeDTW(userFrames, targetLetter);
  }

  public getQiraatVariants(surah: number, ayah: number) {
    return QiraatComparativeEngine.getVariantsForAyat(surah, ayah);
  }

  public calculateNextMemorizationReview(currentState: SuperMemoState, grade: ReviewGrade) {
    return SuperMemoQuranicEngine.calculateNextReview(currentState, grade);
  }

  public checkGharibRules(page: number, ayah: number) {
    return GharibSpecialRecitationHandler.getSpecialGharib(page, ayah);
  }

  public getSystemDiagnostics() {
    return executionContext.getTelemetrySnapshot();
  }
}

export const enterpriseGateway = EnterpriseBackendFacade.getInstance();
