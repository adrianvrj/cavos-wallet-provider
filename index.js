const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { Account,
    ec,
    json,
    stark,
    RpcProvider,
    hash,
    CallData,
    CairoOption,
    CairoOptionVariant,
    CairoCustomEnum, } = require('starknet');
const CryptoJS = require('crypto-js');
const app = express();

const CAVOS_TOKEN = process.env.CAVOS_TOKEN;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('No se proporcionó token');
        return res.sendStatus(401);
    }

    const CAVOS_TOKEN = process.env.CAVOS_TOKEN?.trim();

    if (CAVOS_TOKEN !== token) {
        return res.status(403).json({ error: 'Unathorized' });
    }

    next();
}

function decryptPin(encryptedPin) {
    const bytes = CryptoJS.AES.decrypt(encryptedPin, process.env.SECRET_TOKEN);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function encryptSecretWithPin(pin, secretHex) {
    const cleanHex = secretHex.startsWith("0x") ? secretHex.slice(2) : secretHex;
    const encrypted = CryptoJS.AES.encrypt(cleanHex, pin).toString();
    return encrypted;
}


app.get('/get_wallet', authenticateToken, async (req, res) => {
    let pin = req.query.pinP;
    pin = decryptPin(pin);
    try {
        const argentXaccountClassHash =
            '0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f';

        const privateKeyAX = stark.randomAddress();
        const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

        const axSigner = new CairoCustomEnum({ Starknet: { pubkey: starkKeyPubAX } });
        const axGuardian = new CairoOption(1);
        const AXConstructorCallData = CallData.compile({
            owner: axSigner,
            guardian: axGuardian,
        });
        const AXcontractAddress = hash.calculateContractAddressFromHash(
            starkKeyPubAX,
            argentXaccountClassHash,
            AXConstructorCallData,
            0
        );
        const encryptedPK = encryptSecretWithPin(pin, privateKeyAX);
        return res.json({
            public_key: starkKeyPubAX,
            private_key: encryptedPK,
            address: AXcontractAddress
        });
    } catch (error) {
        console.log("Error al generar wallet:" + error);
        res.status(500).json({ error: 'Error al generar la wallet' });
    }
});


app.listen(3001, () => console.log('API corriendo en http://localhost:3001'));