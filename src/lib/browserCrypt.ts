import type { UserServerInfo, UserLocalInfo } from "./models/UserInfo";

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

export async function RSAencryptBytes(data: BufferSource, key: CryptoKey) {
    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        key,
        data
    );
    return encrypted;
}

export async function RSAdecryptBytes(data: BufferSource, key: CryptoKey) {
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP",
        },
        key,
        data
    );
    return decrypted;
}

export async function AESencryptBytes(ivSource: string, data: BufferSource, key: CryptoKey) {
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


export async function AESdecryptBytes(ivSource: string, data: BufferSource | string, key: CryptoKey) {
    if (typeof data === "string") {
        data = new TextEncoder().encode(data);
    }

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

export async function createUserLocalInfo(username: string, password: string) {
    const { publicKey, privateKey } = await generateRSAKey();
    const aesKey = await generateAESKey(username, password);
    const userInfo: UserLocalInfo = {
        username,
        password,
        aesKey,
        publicKey,
        privateKey
    }
    return userInfo;
}

export async function userInfoToServerInfo(userInfo: UserLocalInfo) {
    const { username, password, publicKey, privateKey, aesKey } = userInfo;
    const hashedPassword = await SHADigest(password);
    const hashedPasswordString = new TextDecoder().decode(hashedPassword);

    const exportPrivateKey = await window.crypto.subtle.exportKey(
        "pkcs8",
        privateKey
    );

    const encryptedPrivateKey = await AESencryptBytes(
        username,
        exportPrivateKey,
        aesKey
    );

    const encryptedPrivateKeyString = new TextDecoder().decode(encryptedPrivateKey);

    const exportPublicKey = await window.crypto.subtle.exportKey(
        "jwk",
        publicKey
    );


    const serverInfo: UserServerInfo = {
        hashedPassword: hashedPasswordString,
        publicKey: exportPublicKey,
        encryptedPrivateKey: encryptedPrivateKeyString
    }
    return serverInfo;
}

export async function serverInfoToUserInfo(serverInfo: UserServerInfo, username: string, password: string): Promise<UserLocalInfo> {
    const info = await createUserLocalInfo(username, password);

    const serverInfoPubKey = await publicRSAJsonWebTokenToCryptoKey(
        serverInfo.publicKey
    );

    const serverInfoPrivKeyBuff = await AESdecryptBytes(
        username,
        serverInfo.encryptedPrivateKey,
        info.aesKey
    );

    const serverInfoPrivKey = await arrayBufferToPrivateRSAKey(
        serverInfoPrivKeyBuff
    );

    // TODO: Validate the public key (with tests?)

    return {
        username: info.username,
        password: info.password,
        aesKey: info.aesKey,
        privateKey: serverInfoPrivKey,
        publicKey: serverInfoPubKey
    }
}

export async function publicRSAJsonWebTokenToCryptoKey(jwk: JsonWebKey) {
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}

// Don't forget to decrypt the array buffer first
export async function arrayBufferToPrivateRSAKey(arrayBuffer: ArrayBuffer) {
    return await window.crypto.subtle.importKey(
        "pkcs8",
        arrayBuffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );
}