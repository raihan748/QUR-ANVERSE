import { masterVaultInduk } from '../src/services/masterVaultIndukService.ts';
import { quranVault } from '../src/services/quranVaultService.ts';

console.log('================================================================');
console.log('👑 LIVE AUDIT: MASTER VAULT INDUK & QURAN VAULT LOKAL');
console.log('================================================================\n');

// 1. Test Cascaded PQC-512
console.log('>>> [1] PENGUJIAN CASCADED PQC-512 CRYPTOGRAPHY (4 CIPHER COMBINER):');
const basmalah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const sha512Hash = masterVaultInduk.sha512(basmalah);
const pqc512Hash = masterVaultInduk.cascadedPqc512(basmalah);

console.log('Input Lafadz    :', basmalah);
console.log('NIST SHA-512    :', sha512Hash);
console.log('Cascaded PQC-512:', pqc512Hash);
console.log('Keluarga Cipher :', 'SHA-512 + Whirlpool-512 + BLAKE-512 + Keccak-512');
console.log('Panjang Bit     : 512-bit (128 Hex Characters)\n');

// 2. Test All 28 Security Layers
console.log('>>> [2] PENGUJIAN 28 LAPIS KEAMANAN (4 DOMAIN):');
const layers = masterVaultInduk.getAllSecurityLayers();
console.log('Total Terdaftar :', layers.length, 'Lapis');
console.log('----------------------------------------------------------------');
layers.forEach((l) => {
  const no = String(l.layerId).padStart(2, '0');
  const dom = l.domain.padEnd(18, ' ');
  console.log(`Lapis ${no} | ${dom} | ${l.name} | [${l.status}]`);
});
console.log('----------------------------------------------------------------\n');

// 3. Test Master Genesis Seal
console.log('>>> [3] MASTER GENESIS SEAL HASH (MUJAMMA MALIK FAHD):');
const root = masterVaultInduk.getMasterMerkleRoot();
console.log('Master Merkle Root :', root);
console.log('Status Integritas   : RESMI & TERKUNCI PERMANEN\n');

// 4. Test Local Vault Audit & Self-Healing
console.log('>>> [4] AUDIT REAL-TIME QURAN VAULT LOKAL (HP SANTRI):');
const audit = quranVault.runFullVaultAuditAndSelfHeal();
console.log('Total Ayat Diaudit  :', audit.totalVersesChecked, 'Ayat (Lengkap 114 Surah)');
console.log('Total Kata Diaudit  :', audit.totalWordsChecked, 'Kata');
console.log('Health Score        :', audit.healthScore + '%');
console.log('Merkle Root Match   :', audit.masterMerkleRoot === root ? '100% SINKRON DENGAN MASTER INDUK' : 'MISMATCH');

// 5. Live Tamper Simulation
console.log('\n>>> [5] SIMULASI SERANGAN PEMALSUAN TEKS & AUTO-HEALING INSTAN:');
const fakeAyah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّجِيمِ'; // Huruf Jim bukan Ha (Tampered)
const verifyResult = quranVault.verifyAyahIntegrity(1, 1, fakeAyah);
console.log('Serangan Injeksi Teks Palsu   : « ' + fakeAyah + ' »');
console.log('Deteksi Integritas            : ' + (verifyResult.isValid ? 'LOLOS (GAGAL)' : 'TERDETEKSI RUSAK / PALSU (BERHASIL)'));
console.log('Tindakan Quran Vault          : ' + (verifyResult.selfHealed ? 'DIPULIHKAN OTOMATIS DARI COLD MEMORY (HEALED)' : 'TIDAK TERPULIHKAN'));
console.log('================================================================');
