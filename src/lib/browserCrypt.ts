export async function SHADigest(msg: ArrayBufferLike | ArrayLike<number> | string) {
    if (typeof msg === "string") {
        msg = new TextEncoder().encode(msg);
    }
    const msgArray = new Uint8Array(msg)
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgArray);
    return hashBuffer;
}

export async function generateAESKey(username: string, password: string) {
    const usernameBytes = new TextEncoder().encode(username);
    const passwordBytes = new TextEncoder().encode(password);

    const keyData = await SHADigest([...usernameBytes, ...passwordBytes]);

    const key = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        "AES-GCM",
        false,
        ["encrypt", "decrypt"]
    );

    return key;
}

export async function generateRSAKey() {
    return await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encryptBytes(ivSource: string, data: BufferSource, key: CryptoKey) {
    const iv = await SHADigest(ivSource);
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv,
        },
        key,
        data
    );
    return encrypted;
}

export async function decryptBytes(ivSource: string, data: BufferSource, key: CryptoKey) {
    const iv = await SHADigest(ivSource);
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv,
        },
        key,
        data
    );
    return decrypted;
}