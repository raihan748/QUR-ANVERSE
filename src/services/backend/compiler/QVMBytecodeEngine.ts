// ==============================================================================
// QURAN VIRTUAL MACHINE (QVM) BYTECODE ENGINE
// Stack-Based Phonetic & Rhythmic Bytecode Execution Environment
// ==============================================================================

export type QVMOpCode = 
  | 'OP_PUSH_PHONEME'
  | 'OP_SET_MAKHRAJ'
  | 'OP_ENFORCE_GHUNNAH'
  | 'OP_EXTEND_MAD'
  | 'OP_APPLY_QALQALAH'
  | 'OP_TRIGGER_SAKTAH'
  | 'OP_EVALUATE_WAQF'
  | 'OP_VERIFY_BEATS'
  | 'OP_JUMP_IF_EQUAL'
  | 'OP_HALT';

export interface QVMInstruction {
  opCode: QVMOpCode;
  operandString?: string;
  operandNumber?: number;
  metadata?: Record<string, unknown>;
}

export interface QVMFrameState {
  stack: (string | number)[];
  instructionPointer: number;
  totalBeatsAccumulated: number;
  isHalted: boolean;
  runtimeLogs: string[];
}

export class QVMBytecodeEngine {
  private instructions: QVMInstruction[] = [];
  private state: QVMFrameState = {
    stack: [],
    instructionPointer: 0,
    totalBeatsAccumulated: 0,
    isHalted: false,
    runtimeLogs: []
  };

  /**
   * Compiles Arabic text into formal QVM Bytecode Instructions.
   */
  public compileTextToBytecode(rawArabic: string): QVMInstruction[] {
    const program: QVMInstruction[] = [];
    const len = rawArabic.length;

    for (let i = 0; i < len; i++) {
      const char = rawArabic[i];
      const nextChar = rawArabic[i + 1] || '';

      // 1. Ghunnah Instruction
      if ((char === 'ن' || char === 'م') && nextChar === '\u0651') {
        program.push({ opCode: 'OP_PUSH_PHONEME', operandString: char });
        program.push({ opCode: 'OP_ENFORCE_GHUNNAH', operandNumber: 3 });
        i++;
        continue;
      }

      // 2. Mad Instruction
      if (char === '\u0653' || char === '~') {
        const isLazim = rawArabic.slice(i, i + 6).includes('\u0651');
        const beats = isLazim ? 6 : 5;
        program.push({ opCode: 'OP_EXTEND_MAD', operandNumber: beats, metadata: { type: isLazim ? 'LAZIM' : 'MUTTASHIL' } });
        continue;
      }

      // 3. Qalqalah Instruction
      if (['ق', 'ط', 'ب', 'ج', 'د'].includes(char) && (nextChar === '\u0652' || nextChar === '\u06DF')) {
        program.push({ opCode: 'OP_PUSH_PHONEME', operandString: char });
        program.push({ opCode: 'OP_APPLY_QALQALAH', operandNumber: 1 });
        i++;
        continue;
      }

      // 4. Saktah Instruction
      if (char === 'ۜ') {
        program.push({ opCode: 'OP_TRIGGER_SAKTAH', operandNumber: 2 });
        continue;
      }

      // Standard Phoneme Push
      if (char !== ' ' && char !== '\t' && char !== '\n') {
        program.push({ opCode: 'OP_PUSH_PHONEME', operandString: char });
      }
    }

    program.push({ opCode: 'OP_VERIFY_BEATS' });
    program.push({ opCode: 'OP_HALT' });
    this.instructions = program;
    return program;
  }

  /**
   * Executes QVM Bytecode inside the virtual stack frame.
   */
  public execute(program?: QVMInstruction[]): QVMFrameState {
    const code = program || this.instructions;
    this.state = {
      stack: [],
      instructionPointer: 0,
      totalBeatsAccumulated: 0,
      isHalted: false,
      runtimeLogs: []
    };

    while (this.state.instructionPointer < code.length && !this.state.isHalted) {
      const inst = code[this.state.instructionPointer];

      switch (inst.opCode) {
        case 'OP_PUSH_PHONEME':
          if (inst.operandString) this.state.stack.push(inst.operandString);
          this.state.totalBeatsAccumulated += 1;
          break;

        case 'OP_ENFORCE_GHUNNAH':
          this.state.totalBeatsAccumulated += (inst.operandNumber || 3) - 1;
          this.state.runtimeLogs.push(`[QVM] Ghunnah enforced: ${inst.operandNumber} beats`);
          break;

        case 'OP_EXTEND_MAD':
          this.state.totalBeatsAccumulated += (inst.operandNumber || 5);
          this.state.runtimeLogs.push(`[QVM] Mad extended: ${inst.operandNumber} beats (${inst.metadata?.type || 'STANDARD'})`);
          break;

        case 'OP_APPLY_QALQALAH':
          this.state.runtimeLogs.push(`[QVM] Qalqalah vibration triggered`);
          break;

        case 'OP_TRIGGER_SAKTAH':
          this.state.runtimeLogs.push(`[QVM] Saktah: 2 beats silent pause`);
          break;

        case 'OP_VERIFY_BEATS':
          this.state.runtimeLogs.push(`[QVM] Verification completed. Total beats: ${this.state.totalBeatsAccumulated}`);
          break;

        case 'OP_HALT':
          this.state.isHalted = true;
          break;
      }

      this.state.instructionPointer++;
    }

    return { ...this.state };
  }
}
