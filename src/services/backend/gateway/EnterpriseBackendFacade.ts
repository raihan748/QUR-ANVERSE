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
import { TajwidAnalysisResult } from '../../../types';

export class EnterpriseBackendFacade {
  private static instance: EnterpriseBackendFacade;
  private astParser = new TajwidASTGrammarParser();

  private constructor() {}

  public static getInstance(): EnterpriseBackendFacade {
    if (!EnterpriseBackendFacade.instance) {
      EnterpriseBackendFacade.instance = new EnterpriseBackendFacade();
    }
    return EnterpriseBackendFacade.instance;
  }

  /**
   * Unified, profiled execution of Quranic tajwid AST analysis.
   */
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

  /**
   * Constructs Abstract Syntax Tree (AST) for an Arabic Quranic verse.
   */
  public parseAyahToAST(arabicText: string): ASTNode {
    return this.astParser.parse(arabicText);
  }

  /**
   * Validates cryptographic authenticity of a verse.
   */
  public verifyVerseSecurity(surah: number, ayah: number, rawArabic: string) {
    return checksumIntegrity.verifyVerseIntegrity(surah, ayah, rawArabic);
  }

  /**
   * Evaluates acoustic pronunciation distance against canonical tajweed makhraj target.
   */
  public evaluateMakhrajAcoustics(userFrames: SpectralFrame[], targetLetter: string) {
    return AcousticPhoneticAlignmentEngine.computeDTW(userFrames, targetLetter);
  }

  /**
   * Retrieves comparative Qira'at readings for a verse.
   */
  public getQiraatVariants(surah: number, ayah: number) {
    return QiraatComparativeEngine.getVariantsForAyat(surah, ayah);
  }

  /**
   * Calculates next spaced repetition review schedule using SuperMemo SM-2.
   */
  public calculateNextMemorizationReview(currentState: SuperMemoState, grade: ReviewGrade) {
    return SuperMemoQuranicEngine.calculateNextReview(currentState, grade);
  }

  /**
   * Checks if a page and ayah contain mutawatir Gharib recitations.
   */
  public checkGharibRules(page: number, ayah: number) {
    return GharibSpecialRecitationHandler.getSpecialGharib(page, ayah);
  }

  /**
   * Returns complete telemetry diagnostics.
   */
  public getSystemDiagnostics() {
    return executionContext.getTelemetrySnapshot();
  }
}

export const enterpriseGateway = EnterpriseBackendFacade.getInstance();
