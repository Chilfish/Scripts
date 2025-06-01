function a() {
  throw new Error('??')
}

function b() {
  return a()
}

function c() {
  const arr = []
  for (let i = 0; i < 100; i++) {
    try {
      b()
      arr.push(i)
    }
    catch {}
  }

  return arr
}

console.log(c())
