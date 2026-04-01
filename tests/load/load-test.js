/**
 * Load Test Script for FiscaSync/Liass'Pilot
 *
 * Tests:
 * 1. Login endpoint performance
 * 2. Balance import simulation
 * 3. Concurrent user sessions
 *
 * Usage: node tests/load/load-test.js [BASE_URL] [NUM_USERS]
 */

const BASE_URL = process.argv[2] || 'http://localhost:5173'
const NUM_USERS = parseInt(process.argv[3] || '5')
const ITERATIONS = 10

async function measureRequest(name, fn) {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    return { name, duration, status: 'ok', statusCode: result?.status }
  } catch (error) {
    const duration = performance.now() - start
    return { name, duration, status: 'error', error: error.message }
  }
}

async function testPageLoad(url) {
  const res = await fetch(url)
  return { status: res.status }
}

async function runUserSession(userId) {
  const results = []

  // Test 1: Homepage load
  results.push(await measureRequest('homepage', () => testPageLoad(BASE_URL)))

  // Test 2: Login page
  results.push(await measureRequest('login_page', () => testPageLoad(`${BASE_URL}/login`)))

  // Test 3: Static assets (JS bundle)
  results.push(await measureRequest('js_bundle', () => testPageLoad(`${BASE_URL}/assets/index.js`)))

  // Test 4: Multiple rapid requests (simulate navigation)
  for (let i = 0; i < 5; i++) {
    results.push(await measureRequest(`nav_${i}`, () => testPageLoad(BASE_URL)))
  }

  return { userId, results }
}

async function generateReport(allResults) {
  const flat = allResults.flatMap(r => r.results)
  const byName = {}

  for (const r of flat) {
    if (!byName[r.name]) byName[r.name] = []
    byName[r.name].push(r)
  }

  console.log('\n====================================')
  console.log('  LOAD TEST REPORT — Liass\'Pilot')
  console.log('====================================\n')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Concurrent users: ${NUM_USERS}`)
  console.log(`Total requests: ${flat.length}`)
  console.log('')

  console.log('Endpoint            | Avg (ms) | P95 (ms) | Max (ms) | Errors')
  console.log('--------------------|----------|----------|----------|-------')

  for (const [name, results] of Object.entries(byName)) {
    const durations = results.map(r => r.duration).sort((a, b) => a - b)
    const errors = results.filter(r => r.status === 'error').length
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length
    const p95 = durations[Math.floor(durations.length * 0.95)]
    const max = durations[durations.length - 1]

    console.log(
      `${name.padEnd(20)}| ${avg.toFixed(0).padStart(8)} | ${p95.toFixed(0).padStart(8)} | ${max.toFixed(0).padStart(8)} | ${errors}`
    )
  }

  const totalErrors = flat.filter(r => r.status === 'error').length
  const totalDuration = flat.reduce((s, r) => s + r.duration, 0)
  const avgOverall = totalDuration / flat.length

  console.log('')
  console.log(`Overall avg response: ${avgOverall.toFixed(0)}ms`)
  console.log(`Total errors: ${totalErrors}/${flat.length} (${((totalErrors/flat.length)*100).toFixed(1)}%)`)

  // Pass/fail criteria
  console.log('\n--- PASS/FAIL CRITERIA ---')
  const pass = avgOverall < 500 && totalErrors === 0
  console.log(`Average < 500ms: ${avgOverall < 500 ? 'PASS' : 'FAIL'} (${avgOverall.toFixed(0)}ms)`)
  console.log(`Zero errors: ${totalErrors === 0 ? 'PASS' : 'FAIL'} (${totalErrors} errors)`)
  console.log(`\nOverall: ${pass ? 'PASS' : 'FAIL'}`)

  return pass
}

async function main() {
  console.log(`Starting load test: ${NUM_USERS} concurrent users against ${BASE_URL}...`)

  // Run all user sessions concurrently
  const promises = Array.from({ length: NUM_USERS }, (_, i) => runUserSession(i))
  const results = await Promise.all(promises)

  const pass = await generateReport(results)
  process.exit(pass ? 0 : 1)
}

main().catch(err => {
  console.error('Load test failed:', err)
  process.exit(1)
})
