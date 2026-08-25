// ==============================================================================
// BYZANTINE FAULT-TOLERANT (BFT) STATE SYNCHRONIZATION ENGINE
// Distributed Consensus State Machine for Peer-to-Peer Hafidz Certification
// ==============================================================================

export interface PeerVote {
  peerId: string;
  surahNumber: number;
  ayahNumber: number;
  proposedHash: string;
  signature: string;
}

export interface ConsensusRoundResult {
  roundId: string;
  agreedHash: string;
  totalPeers: number;
  favorableVotes: number;
  isConsensusReached: boolean; // Requires > 2/3 (66.7%) agreement
}

export class BFTStateSynchronizer {
  private peerRegistry: Set<string> = new Set();

  public registerPeer(peerId: string): void {
    this.peerRegistry.add(peerId);
  }

  /**
   * Evaluates consensus round under Byzantine Fault Tolerance (3f + 1 model).
   */
  public evaluateConsensus(
    roundId: string,
    votes: PeerVote[],
    faultToleranceLimit = 0.33
  ): ConsensusRoundResult {
    const totalPeers = Math.max(this.peerRegistry.size, votes.length);
    if (totalPeers === 0) {
      return {
        roundId,
        agreedHash: '',
        totalPeers: 0,
        favorableVotes: 0,
        isConsensusReached: false
      };
    }

    // Count vote distribution by proposed hash
    const hashCounts: Map<string, number> = new Map();
    votes.forEach((v) => {
      hashCounts.set(v.proposedHash, (hashCounts.get(v.proposedHash) || 0) + 1);
    });

    let topHash = '';
    let maxVotes = 0;
    hashCounts.forEach((count, hash) => {
      if (count > maxVotes) {
        maxVotes = count;
        topHash = hash;
      }
    });

    const consensusThreshold = totalPeers * (1 - faultToleranceLimit);
    const isConsensusReached = maxVotes >= consensusThreshold;

    return {
      roundId,
      agreedHash: topHash,
      totalPeers,
      favorableVotes: maxVotes,
      isConsensusReached
    };
  }
}
