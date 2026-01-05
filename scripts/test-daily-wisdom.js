/**
 * Quick test script to verify daily wisdom rotation works correctly
 * Run with: node scripts/test-daily-wisdom.js
 */

// Simple simulation of the daily wisdom selection logic
// We can't directly import TS modules, so we'll verify the logic

const dailyWisdomCount = 366;

function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getWisdomIndex(dayOfYear) {
  return ((dayOfYear - 1) % 366 + 366) % 366;
}

console.log('=== Daily Wisdom Rotation Test ===\n');

// Test today
const today = new Date();
const todayDay = getDayOfYear(today);
console.log(`Today: ${today.toDateString()}`);
console.log(`Day of Year: ${todayDay}`);
console.log(`Quote Index: ${getWisdomIndex(todayDay)}`);

// Test a few specific dates
const testDates = [
  new Date(2026, 0, 1),   // Jan 1
  new Date(2026, 0, 5),   // Jan 5 (today per screenshot)
  new Date(2026, 5, 15),  // Jun 15
  new Date(2026, 11, 31), // Dec 31
];

console.log('\n=== Date-based Quote Selection ===');
for (const date of testDates) {
  const day = getDayOfYear(date);
  console.log(`${date.toDateString()} -> Day ${day} -> Index ${getWisdomIndex(day)}`);
}

// Verify all 366 days map to unique indices
console.log('\n=== Coverage Test ===');
const indices = new Set();
for (let day = 1; day <= 366; day++) {
  indices.add(getWisdomIndex(day));
}
console.log(`Unique indices generated: ${indices.size}/366`);
console.log(`All days covered: ${indices.size === 366 ? '✓ YES' : '✗ NO'}`);

// Verify day rollover
console.log('\n=== Midnight Rollover Test ===');
const beforeMidnight = new Date(2026, 0, 5, 23, 59, 59);
const afterMidnight = new Date(2026, 0, 6, 0, 0, 1);
console.log(`Jan 5 23:59:59 -> Day ${getDayOfYear(beforeMidnight)}`);
console.log(`Jan 6 00:00:01 -> Day ${getDayOfYear(afterMidnight)}`);
console.log(`Quote changes at midnight: ${getDayOfYear(beforeMidnight) !== getDayOfYear(afterMidnight) ? '✓ YES' : '✗ NO'}`);

console.log('\n=== Test Complete ===');
