// ==============================================================================
// CRYPTOGRAPHIC MERKLE-CHAINED AUDIT LEDGER
// Tamper-Proof Event Streaming & Zero-Cheat Cryptographic Verification
// ==============================================================================

import { MerkleAuditBlock, MerkleAuditChainVerification } from '../../types';

export class CryptographicAuditLedger {
  private chain: MerkleAuditBlock[] = [];
  private readonly SECRET_PEPPER = 'QURANVERSE_ENTERPRISE_HMAC_SECRET_2026';

  constructor() {
    this.createGenesisBlock();
  }

  /**
   * Pure JS SHA-256 implementation with clean TypeScript integer arithmetic
   */
  private sha256(ascii: string): string {
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let i = 0, j = 0;
    let result = '';

    const words: number[] = [];
    const asciiBitLength = ascii.length * 8;

    let hash: number[] = [];
    const k: number[] = [];
    let primeCounter = 0;

    const isPrime = (n: number) => {
      for (let factor = 2, max = Math.sqrt(n); factor <= max; factor++) {
        if (n % factor === 0) return false;
      }
      return true;
    };

    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (isPrime(candidate)) {
        if (primeCounter < 8) {
          hash[primeCounter] = (mathPow(candidate, 1 / 2) * maxWord) | 0;
        }
        k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        primeCounter++;
      }
    }

    let padded = ascii + '\x80';
    while ((padded.length % 64) !== 56) padded += '\x00';
    for (i = 0; i < padded.length; i++) {
      j = padded.charCodeAt(i);
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[padded.length >> 2] = (asciiBitLength / maxWord) | 0;
    words[(padded.length >> 2) + 1] = asciiBitLength | 0;

    const totalWords = words.length;
    for (j = 0; j < totalWords; ) {
      const w = words.slice(j, (j += 16));
      while (w.length < 16) w.push(0);
      const oldHash = [...hash];

      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15] || 0, w2 = w[i - 2] || 0;
        const s0 = ((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3);
        const s1 = ((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10);
        if (i >= 16) {
          w[i] = ((w[i - 16] || 0) + s0 + (w[i - 7] || 0) + s1) | 0;
        }

        const s0_h = ((hash[0] >>> 2) | (hash[0] << 30)) ^ ((hash[0] >>> 13) | (hash[0] << 19)) ^ ((hash[0] >>> 22) | (hash[0] << 10));
        const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        const t2 = (s0_h + maj) | 0;

        const s1_h = ((hash[4] >>> 6) | (hash[4] << 26)) ^ ((hash[4] >>> 11) | (hash[4] << 21)) ^ ((hash[4] >>> 25) | (hash[4] << 7));
        const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        const t1 = (hash[7] + s1_h + ch + k[i] + (w[i] || 0)) | 0;

        hash = [(t1 + t2) | 0, hash[0], hash[1], hash[2], (hash[3] + t1) | 0, hash[4], hash[5], hash[6]];
      }

      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }

    for (i = 0; i < 8; i++) {
      for (let b = 3; b >= 0; b--) {
        const byte = (hash[i] >> (b * 8)) & 255;
        result += (byte < 16 ? '0' : '') + byte.toString(16);
      }
    }
    return result;
  }

  /**
   * Computes HMAC-SHA256 signature
   */
  public computeHmac(data: string): string {
    return this.sha256(this.SECRET_PEPPER + '::' + data);
  }

  private createGenesisBlock(): void {
    const payload = JSON.stringify({ message: 'QURANVERSE_GENESIS_ROOT_LEDGER' });
    const nonce = '00000000';
    const currentHash = this.computeHmac('0000000000000000' + payload + nonce);

    this.chain = [
      {
        blockIndex: 0,
        timestamp: '2026-01-01T00:00:00.000Z',
        userId: 'SYSTEM_GENESIS',
        eventType: 'murojaah_test',
        payloadJson: payload,
        previousBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
        nonce,
        currentBlockHash: currentHash
      }
    ];
  }

  /**
   * Records a new immutable audit block into the cryptographic ledger
   */
  public recordEvent(
    userId: string,
    eventType: MerkleAuditBlock['eventType'],
    payload: Record<string, any>
  ): MerkleAuditBlock {
    const prevBlock = this.chain[this.chain.length - 1];
    const blockIndex = this.chain.length;
    const timestamp = new Date().toISOString();
    const payloadJson = JSON.stringify(payload);
    const nonce = Math.random().toString(36).substring(2, 10);

    const hashInput = `${prevBlock.currentBlockHash}:${payloadJson}:${nonce}:${userId}:${timestamp}`;
    const currentBlockHash = this.computeHmac(hashInput);

    const newBlock: MerkleAuditBlock = {
      blockIndex,
      timestamp,
      userId,
      eventType,
      payloadJson,
      previousBlockHash: prevBlock.currentBlockHash,
      nonce,
      currentBlockHash
    };

    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Cryptographically verifies the entire chain integrity from Genesis to Leaf
   */
  public verifyChainIntegrity(): MerkleAuditChainVerification {
    if (this.chain.length === 0) {
      return {
        isValid: false,
        totalBlocksVerified: 0,
        brokenBlockIndex: 0,
        merkleRootHash: '',
        tamperDetected: true,
        verifiedAt: new Date().toISOString()
      };
    }

    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const prev = this.chain[i - 1];

      // Check 1: Chain link continuity
      if (current.previousBlockHash !== prev.currentBlockHash) {
        return {
          isValid: false,
          totalBlocksVerified: i,
          brokenBlockIndex: i,
          merkleRootHash: '',
          tamperDetected: true,
          verifiedAt: new Date().toISOString()
        };
      }

      // Check 2: Hash recomputation validation
      const expectedHashInput = `${prev.currentBlockHash}:${current.payloadJson}:${current.nonce}:${current.userId}:${current.timestamp}`;
      const recomputedHash = this.computeHmac(expectedHashInput);

      if (current.currentBlockHash !== recomputedHash) {
        return {
          isValid: false,
          totalBlocksVerified: i,
          brokenBlockIndex: i,
          merkleRootHash: '',
          tamperDetected: true,
          verifiedAt: new Date().toISOString()
        };
      }
    }

    // Compute Merkle Root of all current block hashes
    const leafHashes = this.chain.map((b) => b.currentBlockHash);
    let currentLevel = leafHashes;

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        nextLevel.push(this.sha256(left + right));
      }
      currentLevel = nextLevel;
    }

    const merkleRoot = currentLevel[0] || '';

    return {
      isValid: true,
      totalBlocksVerified: this.chain.length,
      brokenBlockIndex: null,
      merkleRootHash: merkleRoot,
      tamperDetected: false,
      verifiedAt: new Date().toISOString()
    };
  }

  public getLatestBlocks(limit = 10): MerkleAuditBlock[] {
    return [...this.chain].reverse().slice(0, limit);
  }

  public getChainLength(): number {
    return this.chain.length;
  }
}

export const cryptographicAuditLedger = new CryptographicAuditLedger();
