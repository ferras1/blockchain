const express = require('express')
const app = express()
const Blockchain = require('./blockchain')
const { v4: uuidv4, v1: uuidv1 } = require('uuid');
const port = process.argv[2]
const rp = require('request-promise')

const nodeAddress = uuidv1().split('-').join('')

const wgtcoin = new Blockchain()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/blockchain', (req,res) => {
    res.send(wgtcoin)    
})

app.post('/transaction', (req,res) => {
    const {newTransaction} = req.body

    const blockIndex = wgtcoin.addTransactionToPendingTransactions(newTransaction)
    res.json({note: `Transaction will be added in block ${blockIndex}.`})
})

app.post('/transaction/broadcast', (req,res) => {
    const {amount,sender,recipient} = req.body
    const newTransaction = wgtcoin.createNewTransaction(amount,sender,recipient)
    
    wgtcoin.addTransactionToPendingTransactions(newTransaction)

    const registerTransactions = []
    wgtcoin.networkNodes.forEach(networkNodeUrl => {
       const requestOptions = {
           uri: networkNodeUrl + '/transaction',
           method: 'POST',
           body: {newTransaction},
           json: true
       }
       registerTransactions.push(rp(requestOptions))
    })

    Promise.all(registerTransactions)
        .then(data => {
            res.json({note: 'Transaction broadcast successful'})
        })
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
    const newBlock = wgtcoin.createNewBlock(nonce,previousBlockHash,blockHash)

    const requestPromises = []
    wgtcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: {newBlock},
            json:true
        }

        requestPromises.push(rp(requestOptions))
    })

    Promise.all(requestPromises)
    .then(data => {
        const requestOptions = {
            uri: wgtcoin.currentNodeUrl + '/transaction/broadcast',
            method: 'POST',
            body: {
                amount: 12.5,
                sender: '00',
                recipient: wgtcoin.nodeAddress
                
            },
            json: true
        }

        return rp(requestOptions)
    })
    .then(data => {
        res.json({
            note: 'New block mined and broadcast succesfully',
            block: newBlock
        })
    })
})

app.post('/receive-new-block', (req,res) => {
    const {newBlock} = req.body
    const lastBlock = wgtcoin.getLastBlock()
    const correctHash = lastBlock.hash === newBlock.previousBlockHash
    const correctIndex = lastBlock['index'] + 1 === newBlock['index']
    
    if(correctHash && correctIndex) {
        wgtcoin.chain.push(newBlock)
        wgtcoin.pendingTransactions = []
        res.json({
            note: 'new blocked received and accepted',
            newBlock
        })
    } else {
        res.json({
            note: 'new blocked rejected',
            newBlock
        })
    }
    
})

app.post('/register-and-broadcast-node', (req,res) => {
    const {newNodeUrl} = req.body 

    if(wgtcoin.networkNodes.indexOf(newNodeUrl) == -1 && wgtcoin.currentNodeUrl !== newNodeUrl)
        wgtcoin.networkNodes.push(newNodeUrl)
    
    const registerNodesPromises  = []
    wgtcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: {newNodeUrl},
            json: true
        }

        registerNodesPromises.push(rp(requestOptions))
    })

    Promise.all(registerNodesPromises).then(data => {
        const bulkRegisterOptions = {
            uri: newNodeUrl + '/register-nodes-bulk',
            method: 'POST',
            body: {allNetworkNodes: [... wgtcoin.networkNodes, wgtcoin.currentNodeUrl]},
            json: true
        }
        
        return rp(bulkRegisterOptions)
    })
    .then(data => {
        res.json({note: 'New node registered with network succesfully'})
    })
})

app.post('/register-node', (req,res) => {
    const {newNodeUrl} = req.body
    const nodeNotAlreadyPresent = wgtcoin.networkNodes.indexOf(newNodeUrl) == -1
    const notCurrentNode = wgtcoin.currentNodeUrl !== newNodeUrl

    if(nodeNotAlreadyPresent && notCurrentNode)
        wgtcoin.networkNodes.push(newNodeUrl)
    
    res.json({note: 'New node registered succesfully.'})
})

app.post('/register-nodes-bulk', (req,res) => {
    const {allNetworkNodes} = req.body

    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyPresent = wgtcoin.networkNodes.indexOf(networkNodeUrl) == -1
        const notCurrentNode = wgtcoin.currentNodeUrl !== networkNodeUrl

        if(nodeNotAlreadyPresent && notCurrentNode)
            wgtcoin.networkNodes.push(networkNodeUrl)
    })
   
    res.json({note: 'Bulk registration successful.'})
})

app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})