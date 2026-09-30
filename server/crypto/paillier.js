import * as paillierBigint from 'paillier-bigint';

export const generateElectionKeys = async () => {
  const { publicKey, privateKey } = await paillierBigint.generateRandomKeys(2048);
  return {
    publicKey: {
      n: publicKey.n.toString(),
      g: publicKey.g.toString()
    },
    privateKey: {
      lambda: privateKey.lambda.toString(),
      mu: privateKey.mu.toString()
    }
  };
};

export const reconstructPublicKey = (pub) => {
  return new paillierBigint.PublicKey(BigInt(pub.n), BigInt(pub.g));
};

export const reconstructPrivateKey = (priv, pub) => {
  return new paillierBigint.PrivateKey(BigInt(priv.lambda), BigInt(priv.mu), reconstructPublicKey(pub));
};

export const homomorphicTally = (ballots, publicKey, candidateCount) => {
  const pub = reconstructPublicKey(publicKey);
  const totalEncrypted = new Array(candidateCount).fill(null);

  for (let i = 0; i < candidateCount; i++) {
    totalEncrypted[i] = pub.encrypt(0n);
  }

  for (const ballot of ballots) {
    for (let i = 0; i < candidateCount; i++) {
      const c = BigInt(ballot.encryptedVector[i]);
      totalEncrypted[i] = pub.addition(totalEncrypted[i], c);
    }
  }

  return totalEncrypted;
};

export const decryptTally = (encryptedTotals, privateKey, publicKey) => {
  const priv = reconstructPrivateKey(privateKey, publicKey);
  return encryptedTotals.map(enc => Number(priv.decrypt(enc)));
};