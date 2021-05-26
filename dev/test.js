const Blockchain = require('./blockchain')
const wgtcoin = new Blockchain()

const bc1 = {
    "chain": [
        {
            "index": 1,
            "timestamp": 1621986877895,
            "transactions": [],
            "nonce": 0,
            "hash": "0",
            "previousBlockHash": "0"
        },
        {
            "index": 2,
            "timestamp": 1621986890056,
            "transactions": [],
            "nonce": 18140,
            "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
            "previousBlockHash": "0"
        },
        {
            "index": 3,
            "timestamp": 1621986890977,
            "transactions": [
                {
                    "transactionId": "97a30ba0bdb411eb8290b9c29449328c",
                    "amount": 12.5,
                    "sender": "00"
                }
            ],
            "nonce": 59472,
            "hash": "000062a5ded172c55839265c1b7c069b083adf6ded6354345c630d1c06deb88e",
            "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
        },
        {
            "index": 4,
            "timestamp": 1621986891817,
            "transactions": [
                {
                    "transactionId": "982d2330bdb411eb8290b9c29449328c",
                    "amount": 12.5,
                    "sender": "00"
                }
            ],
            "nonce": 45673,
            "hash": "000000619b2c5a93503851b358bcf51666da0a819113ea72a7f439577ba0b9fa",
            "previousBlockHash": "000062a5ded172c55839265c1b7c069b083adf6ded6354345c630d1c06deb88e"
        },
        {
            "index": 5,
            "timestamp": 1621986892382,
            "transactions": [
                {
                    "transactionId": "98ad4fb0bdb411eb8290b9c29449328c",
                    "amount": 12.5,
                    "sender": "00"
                }
            ],
            "nonce": 23089,
            "hash": "00003c5a5674f1e8e44f108e1e9b7c4f50c8b92f7fc15856c562fb6bd6a370e4",
            "previousBlockHash": "000000619b2c5a93503851b358bcf51666da0a819113ea72a7f439577ba0b9fa"
        },
        {
            "index": 6,
            "timestamp": 1621986893385,
            "transactions": [
                {
                    "transactionId": "99035ef0bdb411eb8290b9c29449328c",
                    "amount": 12.5,
                    "sender": "00"
                }
            ],
            "nonce": 81082,
            "hash": "00006583d280a819ca18a88faa55dd8428beeac32a9c8a95ba8eb826e49a4d92",
            "previousBlockHash": "00003c5a5674f1e8e44f108e1e9b7c4f50c8b92f7fc15856c562fb6bd6a370e4"
        },
        {
            "index": 7,
            "timestamp": 1621986894626,
            "transactions": [
                {
                    "transactionId": "999c91b0bdb411eb8290b9c29449328c",
                    "amount": 12.5,
                    "sender": "00"
                }
            ],
            "nonce": 120905,
            "hash": "0000e2f5ab72ae4bc747cbea05287e4d8cc72917132682417f1bc3df",
            "previousBlockHash": "00006583d280a819ca18a88faa55dd8428beeac32a9c8a95ba8eb826e49a4d92"
        }
    ],
    "pendingTransactions": [
        {
            "transactionId": "9a5a3c60bdb411eb8290b9c29449328c",
            "amount": 12.5,
            "sender": "00"
        }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
}

console.log('valid',wgtcoin.chainIsValid(bc1.chain))
