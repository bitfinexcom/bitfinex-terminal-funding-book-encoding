const varint = require('varint')
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
      const rate = fractionEncode(b.rate)

      varint.encode(rate[0], slab, ptr)
      ptr += varint.encode.bytes

      varint.encode(rate[1], slab, ptr)
      ptr += varint.encode.bytes

      varint.encode(b.period, slab, ptr)
      ptr += varint.encode.bytes

      varint.encode(b.count, slab, ptr)
      ptr += varint.encode.bytes

      const amount = fractionEncode(b.amount)

      varint.encode(amount[0], slab, ptr)
      ptr += varint.encode.bytes

      varint.encode(amount[1], slab, ptr)
      ptr += varint.encode.bytes
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
      const rate = varint.decode(buf, ptr)
      ptr += varint.decode.bytes

      const rateM = varint.decode(buf, ptr)
      ptr += varint.decode.bytes

      const period = varint.decode(buf, ptr)
      ptr += varint.decode.bytes

      const count = varint.decode(buf, ptr)
      ptr += varint.decode.bytes

      const amount = varint.decode(buf, ptr)
      ptr += varint.decode.bytes

      const amountM = varint.decode(buf, ptr)
      ptr += varint.decode.bytes

      entry.book.push({
        rate: fractionDecode(rate, rateM),
        period,
        count,
        amount: fractionDecode(amount, amountM)
      })
    }

    return entry
  }
}

module.exports = { valueEncoding, keyEncoding }

function count10s (n) {
  if (n === 0) return 0

  let m = 0
  while (Math.floor(n / 10) === n / 10) {
    m++
    n /= 10
  }

  return m
}

function fractionEncode (n) {
  const sign = n < 0 ? -1 : 1

  if (Math.floor(n) === n) {
    return sign < 0 ? [-10 * n, 1] : [n, 0]
  }

  n *= sign

  let m = 0

  const top = Math.floor(n)

  let digits = 0
  let f = 1
  while (10 * f * top < Number.MAX_SAFE_INTEGER && digits < 10) {
    digits++
    f *= 10
  }

  n -= top
  m = digits - count10s(Math.round(n * f))

  const pow = Math.pow(10, m)
  return [Math.round(top * pow + n * pow), zigzagEncode(sign * m)]
}

function fractionDecode (n, m) {
  m = zigzagDecode(m)
  const pow = m < 0 ? -Math.pow(10, -m) : Math.pow(10, m)
  return n / pow
}

function zigzagDecode (n) {
  return n === 0 ? n : (n & 1) === 0 ? n / 2 : -(n + 1) / 2
}

function zigzagEncode (n) {
  // 0, -1, 1, -2, 2, ...
  return n < 0 ? (2 * -n) - 1 : n === 0 ? 0 : 2 * n
}
