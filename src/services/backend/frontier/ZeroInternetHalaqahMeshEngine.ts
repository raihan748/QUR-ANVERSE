// ==============================================================================
// ZERO-INTERNET HALAQAH P2P MESH NETWORK ENGINE
// Decentralized Local Subnet Peer-to-Peer Protocol for Internet-Free Pesantren
// ==============================================================================

export type HalaqahRole = 'USTADZ_COORDINATOR' | 'SANTRI_PEER';

export type MeshPacketType = 
  | 'HALAQAH_HEARTBEAT'
  | 'TILAWAH_SUBMISSION'
  | 'USTADZ_TASHIH_DISPATCH'
  | 'CONSENSUS_LEADERBOARD_SYNC';

export interface MeshPacket<T = any> {
  id: string;
  type: MeshPacketType;
  senderId: string;
  senderName: string;
  recipientId?: string; // Broadcast if undefined
  timestamp: number;
  payload: T;
  signature: string;
}

export interface PeerNodeInfo {
  nodeId: string;
  name: string;
  role: HalaqahRole;
  lastSeenMs: number;
  latencyMs: number;
  totalSubmissions: number;
}

export interface TilawahSubmissionPayload {
  surahNumber: number;
  ayahNumber: number;
  score: number;
  tajweedPassed: boolean;
  warningsCount: number;
  timestamp: number;
}

export interface TashihFeedbackPayload {
  submissionId: string;
  santriId: string;
  ustadzGrade: 'MUMTAZ' | 'JAYYID_JIDDAN' | 'JAYYID' | 'RASIB';
  correctionNotes: string;
  approved: boolean;
}

export class ZeroInternetHalaqahMeshEngine {
  private static instance: ZeroInternetHalaqahMeshEngine | null = null;
  private localNodeId: string = `node_${Math.random().toString(36).substring(2, 9)}`;
  private localRole: HalaqahRole = 'SANTRI_PEER';
  private localName: string = 'Santri Quranverse';
  private peers: Map<string, PeerNodeInfo> = new Map();
  private receivedPacketIds: Set<string> = new Set();
  private pendingOutbox: MeshPacket[] = [];

  private constructor() {}

  public static getInstance(): ZeroInternetHalaqahMeshEngine {
    if (!ZeroInternetHalaqahMeshEngine.instance) {
      ZeroInternetHalaqahMeshEngine.instance = new ZeroInternetHalaqahMeshEngine();
    }
    return ZeroInternetHalaqahMeshEngine.instance;
  }

  public initializeLocalNode(name: string, role: HalaqahRole): string {
    this.localName = name;
    this.localRole = role;
    return this.localNodeId;
  }

  public createPacket<T>(type: MeshPacketType, payload: T, recipientId?: string): MeshPacket<T> {
    const packet: MeshPacket<T> = {
      id: `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      senderId: this.localNodeId,
      senderName: this.localName,
      recipientId,
      timestamp: Date.now(),
      payload,
      signature: `SIG_${this.localNodeId.substring(0, 5)}_${Date.now().toString(16)}`
    };
    this.pendingOutbox.push(packet);
    return packet;
  }

  public processIncomingPacket(rawPacket: MeshPacket): { accepted: boolean; action: string } {
    if (this.receivedPacketIds.has(rawPacket.id)) {
      return { accepted: false, action: 'DUPLICATE_IGNORED' };
    }
    this.receivedPacketIds.add(rawPacket.id);

    // Update peer node directory
    const existing = this.peers.get(rawPacket.senderId);
    this.peers.set(rawPacket.senderId, {
      nodeId: rawPacket.senderId,
      name: rawPacket.senderName,
      role: rawPacket.senderId.includes('ustadz') ? 'USTADZ_COORDINATOR' : 'SANTRI_PEER',
      lastSeenMs: Date.now(),
      latencyMs: Math.max(1, Math.round((Date.now() - rawPacket.timestamp) % 150)),
      totalSubmissions: (existing?.totalSubmissions || 0) + (rawPacket.type === 'TILAWAH_SUBMISSION' ? 1 : 0)
    });

    return { accepted: true, action: `PROCESSED_${rawPacket.type}` };
  }

  public getConnectedPeers(): PeerNodeInfo[] {
    return Array.from(this.peers.values());
  }

  public getMeshHealth(): { connectedNodes: number; pendingQueueLength: number; localNodeId: string } {
    return {
      connectedNodes: this.peers.size,
      pendingQueueLength: this.pendingOutbox.length,
      localNodeId: this.localNodeId
    };
  }
}

export const halaqahMesh = ZeroInternetHalaqahMeshEngine.getInstance();
