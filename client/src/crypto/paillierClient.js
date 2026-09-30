import * as paillierBigint from 'paillier-bigint';

// Construct one-hot vector and encrypt client-side
export const encryptVoteVector = (selectedIndex, candidateCount, publicKeyData) => {
  const pub = new paillierBigint.PublicKey(
    BigInt(publicKeyData.n),
    BigInt(publicKeyData.g)
  );

  const encryptedVector = [];
  for (let i = 0; i < candidateCount; i++) {
    // Encrypt 1n for selected candidate, 0n for all others
    const plaintext = i === selectedIndex ? 1n : 0n;
    const ciphertext = pub.encrypt(plaintext);
    encryptedVector.push(ciphertext.toString());
  }

  return encryptedVector;
};