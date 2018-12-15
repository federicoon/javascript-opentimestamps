const test = require('tape')
const Explorer = require('../src/chain-explorer.js')
const options = {
	explorers: [
    	{url: 'https://blockstream.info/testnet/api', type: 'blockstream'},
    	{url: 'https://testnet.blockexplorer.com/api', type: 'insight'}
    ],
    chain: 'bitcoinTestnet',
        timeout: 11
}

test('chainExplorer.js test', assert => {
  assert.pass('This test will pass.')

  assert.end()
})

test('ChainExplorer blockhash test', assert => {
  const m = new Explorer.MultiExplorer(options)
  const resultPromise = m.blockhash(0)
  resultPromise.then(result => {
    assert.equals(result, '000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943', 'genesis block matches')
    assert.end()
  }).catch(err => {
    assert.fail('err=' + err)
  })
})

test('ChainExplorer block test', assert => {
  const m = new Explorer.MultiExplorer(options)
  const resultPromise = m.block('000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943')
  resultPromise.then(result => {
    assert.equals(result.merkleroot, '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b', 'genesis block merkle root matches')
    assert.end()
  }).catch(err => {
    assert.fail('err=' + err)
  })
})
