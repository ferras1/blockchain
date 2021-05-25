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

app.post('/register-and-broadcast-node', (req,res) => {
    const {newNodeUrl} = req.body 

    if(wgtcoin.networkNodes.indexOf(newNodeUrl) == -1)
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