const varint = require('varint')
const varintf = require('varint-fraction')
const lexint = require('lexicographic-integer')

const SLAB_SIZE = 512 * 1024
const MAX_CHUNK = 64 * 1024
const SEP = Buffer.from([0])

let slab = Buffer.allocUnsafe(SLAB_SIZE)

const keyEncoding = {
  encode (date) {
    if (Array.isArray(date)) {
      return Buffer.concat([Buffer.from(date[0]), SEP, Buffer.from(lexint.pack(date[1]))])
    }

    if (Buffer.isBuffer(date)) return date

    if (typeof date !== 'number') {
      date = date.getTime()
    }

    return Buffer.from(lexint.pack(date))
  },
  decode (buf) {
    const r = lexint.unpack(buf.toString('hex'), 'hex')
    if (r === undefined) {
      const i = buf.indexOf(0)
      return [buf.subarray(0, i).toString(), new Date(lexint.unpack(buf.subarray(i + 1).toString('hex'), 'hex'))]
    }
    return new Date(r)
  }
}

const valueEncoding = {
  encode (entry) {
    if (slab.length < MAX_CHUNK) slab = Buffer.allocUnsafe(SLAB_SIZE)

    let ptr = 0

    varint.encode(entry.date.getTime(), slab, ptr)
    ptr += varint.encode.bytes

    for (const b of entry.book) {
      varintf.encode(b.rate, slab, ptr)
      ptr += varintf.encode.bytes

      varint.encode(b.period, slab, ptr)
      ptr += varint.encode.bytes

      varint.encode(b.count, slab, ptr)
      ptr += varint.encode.bytes

      varintf.encode(b.amount, slab, ptr)
      ptr += varintf.encode.bytes
    }

    const buf = slab.subarray(0, ptr)
    slab = slab.subarray(ptr)
    return buf
  },
  decode (buf) {
    let ptr = 0
    const entry = { date: null, book: [] }

    entry.date = new Date(varint.decode(buf, ptr))
    ptr += varint.decode.bytes

    while (ptr < buf.length) {
      const rate = varintf.decode(buf, ptr)
      ptr += varintf.decode.bytes

      const period = varint.decode(buf, ptr)
      ptr += varint.decode.bytes

      const count = varint.decode(buf, ptr)
      ptr += varint.decode.bytes

      const amount = varintf.decode(buf, ptr)
      ptr += varintf.decode.bytes

      entry.book.push({
        rate,
        period,
        count,
        amount
      })
    }

    return entry
  }
}

module.exports = { valueEncoding, keyEncoding }
