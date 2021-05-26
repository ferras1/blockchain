const sha256 = require('sha256')
const currentNodeUrl = process.argv[3]
const { v4: uuidv4, v1: uuidv1 } = require('uuid');


class Blockchain {
    constructor() {
        this.chain = []
        this.pendingTransactions = []

        this.currentNodeUrl = currentNodeUrl
        this.networkNodes = []

        this.createNewBlock(0,'0','0')
    }

    createNewBlock(nonce,previousBlockHash,hash) {
        const newBlock = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce,
            hash,
            previousBlockHash
        }

        this.pendingTransactions = []
        this.chain.push(newBlock)

        return newBlock
    }

    getLastBlock() {
        return this.chain[this.chain.length-1]
    }

    createNewTransaction(amount, sender, recipient) {
        const transactionId = uuidv1().split('-').join('')
        const newTransaction = {
            transactionId, 
            amount,
            sender,
            recipient
        }
        return newTransaction        
    }

    addTransactionToPendingTransactions(transaction) {
        this.pendingTransactions.push(transaction)
        return this.getLastBlock().index +1
    }

    hashBlock(previousBlockHash, currentBlockData, nonce) {
        const dataString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData)
        return sha256(dataString)
    }

    proofOfWork(previousBlockHash,currentBlockData) {
        let nonce = 0
        let hash = this.hashBlock(previousBlockHash,currentBlockData,nonce)
        
        while(hash.substring(0,4) !== '0000') {
            nonce++
            hash = this.hashBlock(previousBlockHash,currentBlockData,nonce)    
        }

        return nonce
    }

    chainIsValid(blockchain) {
        for(var i = 1;i < blockchain.length;i++) {
            const currentBlock = blockchain[i]
            const previousBlock = blockchain[i-1]
            const blockHash = this.hashBlock(previousBlock['hash'], {transactions: currentBlock['transactions'], index: currentBlock['index']},currentBlock['nonce'])
     
            if(blockHash.substring(0,4) !== '0000')
                return false
            if(currentBlock.previousBlockHash !== previousBlock.hash) 
                return false
        }

        const genesisBlock = blockchain[0]
        const correctNonce = genesisBlock['nonce'] === 0
        const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0'
        const correctHash = genesisBlock['hash'] === '0'
        const correctTransactions = genesisBlock['transactions'].length === 0

        if(!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions)
            return false
            
        return true
    }

    getBlock(blockHash) {
        let returnBlock = null
        this.chain.forEach((block) => {
            if(block.hash === blockHash)
                returnBlock = block
        })

        return returnBlock
    }

    getTransaction(transactionId) {
        let returnTransaction = null
        let returnBlock = null
        this.chain.forEach((block) => {
            block.transactions.forEach((transaction) => {
                if(transaction.transactionId === transactionId)
                    returnTransaction = transaction
                    returnBlock = block
            })
        })
        return {transaction: returnTransaction, block: returnBlock}
    }

    getAddressData(address) {
        const addressTransactions = []

        this.chain.forEach((block) => {
            block.transactions.forEach((transaction) => {
                if(transaction.sender === address || transaction.recipient === address)
                    addressTransactions.push(transaction)
            })
        })

        let addressBalance = 0
        addressTransactions.forEach((transaction) => {
            if(transaction.recipient === address)
                addressBalance += transaction.amount
            else
                addressBalance -+ transaction.amount
        })

        return {addressTransactions,addressBalance}
    }

}

module.exports = Blockchain