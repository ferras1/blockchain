const express = require('express')
const app = express()
const Blockchain = require('./blockchain')
const { v4: uuidv4, v1: uuidv1 } = require('uuid');

const nodeAddress = uuidv1().split('-').join('')

const wgtcoin = new Blockchain()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/blockchain', (req,res) => {
    res.send(wgtcoin)    
})

app.post('/transaction', (req,res) => {
    const {amount,sender,recipient} = req.body

    const blockIndex = wgtcoin.createNewTransaction(amount,sender,recipient)
    res.json({note: `Transaction will be added in block ${blockIndex}.`})
})

app.get('/mine', (req,res) => {
    const lastBlock = wgtcoin.getLastBlock()
    const previousBlockHash = lastBlock.hash
    const currentBlockData = {
        transactions: wgtcoin.pendingTransactions,
        index: lastBlock.index + 1
    }

    const nonce = wgtcoin.proofOfWork(previousBlockHash,currentBlockData)
    const blockHash = wgtcoin.hashBlock(previousBlockHash,currentBlockData,nonce)

    wgtcoin.createNewTransaction(12.5,"00",nodeAddress)
    const newBlock = wgtcoin.createNewBlock(nonce,previousBlockHash,blockHash)

    res.json({
        note: 'New block mined succesfully',
        block: newBlock
    })
})

app.listen(3000, () => {
    console.log('Listening on port 3000...')
})