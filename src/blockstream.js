'use strict'

/**
 * Blockstream module.
 * @module Blockstream
 * @author federicoon
 * @license LPGL3
 */

const requestPromise = require('request-promise')
const Promise = require('promise')
const Utils = require('./utils.js')

/** Class used to query Blockstream API */
class BlockstreamExplorer {
  /**
   * Create a RemoteCalendar.
   * @param {int} timeout - timeout (in seconds) used for calls to Blockstream server
   */
  constructor (url, timeout) {
    this.urlBlockindex = url + '/block-height'
    this.urlBlock = url + '/block'
    this.timeout = timeout * 1000
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
        Accept: 'application/json',
        'User-Agent': 'javascript-opentimestamps',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      json: true,
      timeout: this.timeout
    }

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
   * Retrieve the block information from the block hash.
   * @param {string} height - Height of the block.
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

const publicBlockstreamUrls = {
  bitcoin: ['https://blockstream.info/api'],
  bitcoinTestnet: ['https://blockstream.info/testnet/api']
}

module.exports = {
  BlockstreamExplorer,
  publicBlockstreamUrls
}
