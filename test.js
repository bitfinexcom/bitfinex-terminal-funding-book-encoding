const tape = require('tape')
const { valueEncoding } = require('./')

tape('encode and decode', function (t) {
  const entry = {
    date: new Date('2021-03-04T14:37:00.237Z'),
    book: [
      { rate: 0.00000346, period: 120, count: 1, amount: -443.48051367 },
      { rate: 0.00002229, period: 2, count: 1, amount: 24.54742639 },
      { rate: 0.00002496, period: 2, count: 2, amount: 71.99316349 },
      { rate: 0.000025, period: 7, count: 1, amount: 335.32328189 },
      { rate: 0.00003, period: 7, count: 1, amount: 148.29598416 },
      { rate: 0.0000683, period: 3, count: 1, amount: 58.29540046 },
      { rate: 0.00018952, period: 2, count: 1, amount: 4.8002043 },
      { rate: 0.00019949, period: 2, count: 1, amount: 1067.479396 },
      { rate: 0.0002, period: 2, count: 1, amount: 36.01219347 },
      { rate: 0.0002, period: 120, count: 1, amount: 3.84041116 },
      { rate: 0.00020793, period: 2, count: 1, amount: 19598 },
      { rate: 0.00025, period: 120, count: 1, amount: 3 },
      { rate: 0.0003, period: 120, count: 1, amount: 3 },
      { rate: 0.000348, period: 120, count: 1, amount: 20.03925508 },
      { rate: 0.0004, period: 2, count: 1, amount: 31.37756668 },
      { rate: 0.0005, period: 120, count: 1, amount: 3 },
      { rate: 0.0007, period: 14, count: 1, amount: 6.45007393 },
      { rate: 0.0007, period: 120, count: 1, amount: 3 },
      { rate: 0.00098, period: 2, count: 1, amount: 49.800199 },
      { rate: 0.001, period: 2, count: 1, amount: 275.80788854 },
      { rate: 0.001, period: 5, count: 1, amount: 901.61340921 },
      { rate: 0.001, period: 120, count: 1, amount: 3 },
      { rate: 0.00109, period: 30, count: 1, amount: 21.93805925 },
      { rate: 0.0011, period: 22, count: 1, amount: 6.35 },
      { rate: 0.00111, period: 2, count: 1, amount: 77.84168562 },
      { rate: 0.0015, period: 120, count: 1, amount: 3 },
      { rate: 0.002, period: 120, count: 1, amount: 3 },
      { rate: 0.0044, period: 88, count: 1, amount: 6.35 },
      { rate: 0.005, period: 10, count: 1, amount: 99 },
      { rate: 0.01, period: 30, count: 1, amount: 8000 },
      { rate: 0.02, period: 120, count: 1, amount: 1841 },
      { rate: 0.03, period: 120, count: 1, amount: 5000 },
      { rate: 0.05, period: 120, count: 1, amount: 5000 },
      { rate: 0.07, period: 120, count: 1, amount: 5000 }
    ]
  }

  const buf1 = valueEncoding.encode(entry)
  const buf2 = valueEncoding.encode(entry)

  t.same(buf1, buf2, 'consistent encoding')

  const e = valueEncoding.decode(buf1)

  t.same(e, entry)
  t.end()
})
