# bitfinex-terminal-funding-encoding

Hyperbee Key and Value-Encodings for the Bitfinex Terminal Funding Book data set.

## Example

```js
const dazaar = require('dazaar')
const swarm = require('dazaar/swarm')
const Hyperbee = require('hyperbee')

// Load the encodings
const { keyEncoding, valueEncoding } = require('bitfinex-terminal-funding-book-encoding')

const card = require('../cards/free/bitfinex.terminal.funding-book.stats.json')
const buyer = market.buy(card, { sparse: true })

buyer.on('feed', function () {
  const db = new Hyperbee(buyer.feed, {
    keyEncoding,
    valueEncoding
  })

  doQuery(db)
})

function doQuery (db) {
  // Load the sub database for the currency you are looking for.
  db.sub('BTC').createReadStream({
    gte: new Date('2018-10-10T09:00:00.000Z'),
    lte: new Date('2019-10-10T09:00:00.000Z'),
    limit: 10,
    reverse: true
  }).on('data', (d) => {
    console.log(d)
  })
}


swarm(buyer)
```

## API

Just pass the `keyEncoding` and `valueEncoding` modules to the Hyperbee constructor.

After that you can specify your range queries as dates for the currency sub database you want to query.
