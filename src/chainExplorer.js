'use strict'

/**
 * Insight module.
 * @module ChainExplorer
 * @author federicoon
 * @license LPGL3
 */

const requestPromise = require('request-promise')
const Promise = require('promise')
const Utils = require('./utils.js')

/** Abstract Class used to query block explorers API */
class ChainExplorer {
  /**
   * Create a ChainExplorer.
   * @param {int} timeout - timeout (in seconds) used for calls to explorer servers
   */
  constructor (url, timeout) {
    this.timeout = timeout * 1000
    this.urlBlockindex = url
    this.urlBlock = url
  }

  /**
   * Retrieve the block hash from the block height.
   * @param {string} height - Height of the block.
   * @returns {Promise} A promise that returns {@link resolve} if resolved
   * and {@link reject} if rejected.
   */
  blockhash (height) {
    const options = {
      url: this.urlBlockindex + '/' + height,
      method: 'GET',
      headers: {
        Accept: '*/*',
        'User-Agent': 'javascript-opentimestamps',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      json: true,
      timeout: this.timeout
    }

    return this.parseBlockhash(options)
  }

  /**
   * Retrieve the block hash by calling an explorer server.
   * Default empty implementation: must be overridden by subclasses.
   * @param {Object} options - The http request options.
   * @returns {string} The block hash
   */
  parseBlockhash (options) {
	return ''
  }

  /**
   * Retrieve the block information from the block hash.
   * @param {string} hash - Hash of the block.
   * @returns {Promise} A promise that returns {@link resolve} if resolved
   * and {@link reject} if rejected.
   */
  block (hash) {
    const options = {
      url: this.urlBlock + '/' + hash,
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'javascript-opentimestamps',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      json: true,
      timeout: this.timeout
    }

    return this.parseBlockInfo(options)
  }

  /**
   * Retrieve the block information by calling an explorer server.
   * Default empty implementation: must be overridden by subclasses.
   * @param {Object} options - The http request options.
   * @returns {Object} The block information
   */
  parseBlockInfo (options) {
	return {merkleroot: '', time: 0}
  }
}

/** Class used to query Insight API */
class ChainInsight extends ChainExplorer {
  /**
   * Create a ChainInsight.
   * @param {int} timeout - timeout (in seconds) used for calls to insight servers
   */
  constructor (url, timeout) {
    super(url, timeout)
    this.urlBlockindex = url + '/block-index'
    this.urlBlock = url + '/block'

    // this.urlBlockindex = 'https://search.bitaccess.co/insight-api/block-index';
    // this.urlBlock = 'https://search.bitaccess.co/insight-api/block';
    // this.urlBlock = "https://insight.bitpay.com/api/block-index/447669";
  }

  /**
   * This callback is called when the result is loaded.
   *
   * @callback resolve
   * @param {Timestamp} timestamp - The timestamp of the Calendar response.
   */

  /**
   * This callback is called when the result fails to load.
   *
   * @callback reject
   * @param {Error} error - The error that occurred while loading the result.
   */

  /**
   * Retrieve the block hash by calling an explorer server.
   * @param {Object} options - The http request options.
   * @returns {Promise} A promise that returns {@link resolve} if resolved
   * and {@link reject} if rejected.
   */
  parseBlockhash (options) {
    return new Promise((resolve, reject) => {
        requestPromise(options)
          .then(body => {
            // console.log('body ', body);
            if (body.size === 0) {
              console.error('Insight response error body ')
              reject(new Error('Insight response error body '))
              return
            }

            resolve(body.blockHash)
          })
          .catch(err => {
            console.error('Insight response error: ' + err.toString().substr(0, 100))
            reject(err)
          })
      })
  }

  /**
   * Retrieve the block information by calling an explorer server.
   * @param {Object} options - The http request options.
   * @returns {Promise} A promise that returns {@link resolve} if resolved
   * and {@link reject} if rejected.
   */
  parseBlockInfo (options) {
    return new Promise((resolve, reject) => {
        requestPromise(options)
          .then(body => {
            // console.log('body ', body);
            if (!body) {
              console.error('Insight response error body ')
              return reject(new Error('Insight response error body '))
            }
            if (!body.merkleroot || !body.time) {
              return reject(new Error('Insight response error body '))
            }
            resolve({merkleroot: body.merkleroot, time: body.time})
          })
          .catch(err => {
            console.error('Insight response error: ' + err.toString().substr(0, 100))
            reject(err)
          })
      })
  }
}

/** Class used to query Blockstream API */
class Blockstream extends ChainExplorer {
  /**
   * Create a RemoteCalendar.
   * @param {int} timeout - timeout (in seconds) used for calls to Blockstream server
   */
  constructor (url, timeout) {
    super(url, timeout)
    this.urlBlockindex = url + '/block-height/' // need a '/' more, as api urls with heading '/0' are not decoded correctly!
    this.urlBlock = url + '/block/'
  }

  /**
   * This callback is called when the result is loaded.
   *
   * @callback resolve
   * @param {Timestamp} timestamp - The timestamp of the Calendar response.
   */

  /**
   * This callback is called when the result fails to load.
   *
   * @callback reject
   * @param {Error} error - The error that occurred while loading the result.
   */

  /**
   * Retrieve the block hash by calling an explorer server.
   * @param {Object} options - The http request options.
   * @returns {Promise} A promise that returns {@link resolve} if resolved
   * and {@link reject} if rejected.
   */
  parseBlockhash (options) {
    return new Promise((resolve, reject) => {
        requestPromise(options)
          .then(body => {
            // console.log('body ', body);
            if (!body) {
              console.error('Blockstream response error body ')
              reject(new Error('Blockstream response error body '))
              return
            }

            resolve(body)
          })
          .catch(err => {
            console.error('Blockstream response error: ' + err.toString().substr(0, 100))
            reject(err)
          })
      })
  }

  /**
   * Retrieve the block information by calling an explorer server.
   * @param {Object} options - The http request options.
   * @returns {Promise} A promise that returns {@link resolve} if resolved
   * and {@link reject} if rejected.
   */
  parseBlockInfo (options) {
    return new Promise((resolve, reject) => {
        requestPromise(options)
          .then(body => {
            // console.log('body ', body);
            if (!body) {
              console.error('Blockstream response error body ')
              return reject(new Error('Blockstream response error body '))
            }
            if (!body.merkle_root || !body.timestamp) {
              return reject(new Error('Blockstream response error body '))
            }
            resolve({merkleroot: body.merkle_root, time: body.timestamp})
          })
          .catch(err => {
            console.error('Blockstream response error: ' + err.toString().substr(0, 100))
            reject(err)
          })
      })
  }
}

const publicChainInsightUrls = {}
publicChainInsightUrls.bitcoin = [
//  'https://www.localbitcoinschain.com/api',  // gives 502 - "lots of HTML code"
//  'https://search.bitaccess.co/insight-api',   // gives 400 - "Block height out of range. Code:-8"
  'https://insight.bitpay.com/api',
  'https://btc-bitcore1.trezor.io/api',
  'https://btc-bitcore4.trezor.io/api',
  'https://blockexplorer.com/api',
  'https://bitcore.schmoock.net/insight-api'
]
publicChainInsightUrls.bitcoinTestnet = [
  'https://test-insight.bitpay.com/api',
  'https://testnet.blockexplorer.com/api'
]
publicChainInsightUrls.litecoin = [
  'https://ltc-bitcore1.trezor.io/api',
  'https://insight.litecore.io/api'
]

const publicBlockstreamUrls = {
  bitcoin: ['https://blockstream.info/api'],
  bitcoinTestnet: ['https://blockstream.info/testnet/api']
}

class MultiExplorer {
  /** Constructor
   * @param {object} options - Options
   * @param {String} options.chain: block explorer chain
   * @param {Object[]} options.explorers: array of block explorer server objects
   * @param {String} options.explorers[].type: block explorer server type: {insight|blockstream}
   * @param {String} options.explorers[].url: block explorer server url
   * @param {number} options.timeout: timeout(in seconds) used for calls to insight servers
   */
  constructor (options) {
    this.explorers = []

    // Sets requests timeout (default = 10s)
    const timeoutOptionSet = options && Object.prototype.hasOwnProperty.call(options, 'timeout')
    const timeout = timeoutOptionSet ? options.timeout : 10
    const chainOptionSet = options && Object.prototype.hasOwnProperty.call(options, 'chain')
    const chain = chainOptionSet ? options.chain : 'bitcoin'

    // We need at least 2 explorer servers (for confirmation)
    const explorersOptionSet = options && Object.prototype.hasOwnProperty.call(options, 'explorers') && options.explorers.length > 1
    const explorers = explorersOptionSet ? options.explorers : publicChainInsightUrls[chain].map(u=>{return {url: u, type: 'insight'}})

    explorers.forEach(explorer => {
      if (typeof (explorer.url) !== 'string') {
        throw new TypeError('URL must be a string')
      }
      var i
      if (explorer.type && explorer.type === 'insight') {
        i = new ChainInsight(explorer.url, timeout)
      } else {
        i = new Blockstream(explorer.url, timeout)
      }
      this.explorers.push(i)
    })
  }

  blockhash (height) {
    const res = []
    this.explorers.forEach(explorer => {
      res.push(explorer.blockhash(height))
    })
    return new Promise((resolve, reject) => {
      Promise.all(res.map(Utils.softFail)).then(results => {
        // console.log('results=' + results);
        const set = new Set()
        results.filter(result => { if (result && !(result instanceof Error)) { set.add(JSON.stringify(result)) } })
        if (set.size === 0) {
          reject(new Error('No block height ' + height + 'found'))
        } else if (set.size === 1) {
          resolve(JSON.parse(set.values().next().value))
        } else {
          reject(new Error('Different block height ' + height + 'found'))
        }
      })
    })
  }

  block (hash) {
    const res = []
    this.explorers.forEach(explorer => {
      res.push(explorer.block(hash))
    })
    return new Promise((resolve, reject) => {
      Promise.all(res.map(Utils.softFail)).then(results => {
        // console.log('results=' + results);
        const set = new Set()
        results.filter(result => { if (result && !(result instanceof Error)) { set.add(JSON.stringify(result)) } })
        if (set.size === 0) {
          reject(new Error('No block hash ' + hash + 'found'))
        } else if (set.size === 1) {
          resolve(JSON.parse(set.values().next().value))
        } else {
          reject(new Error('Different block hash ' + hash + 'found'))
        }
      })
    })
  }
}

module.exports = {
  ChainInsight,
  Blockstream,
  MultiExplorer
}
