
export interface UserLocalInfo {
    username: string;
    password: string;
    aesKey: CryptoKey;
    publicKey: CryptoKey;
    privateKey: CryptoKey;
}

// We don't store the username in the server info because it is already the key
export interface UserServerInfo {
    hashedPassword: string;
    publicKey: JsonWebKey;
    encryptedPrivateKey: string;
}