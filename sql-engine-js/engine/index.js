// engine/index.js
const fs = require('fs');
const path = require('path');
const { parseSimpleSQL } = require('./parser');
const { executeSelect } = require('./executor');

// load data
const DB = {
  customers: require('../data/customers.json'),
  sales: require('../data/sales.json')
};

function runQuery(sql) {
  try {
    const q = parseSimpleSQL(sql);
    const res = executeSelect(q, DB);
    console.table(res);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

if (require.main === module) {
  const sql = process.argv.slice(2).join(' ');
  if (!sql) {
    console.log('Usage: node engine/index.js "SELECT * FROM customers WHERE region = \'East\';"');
    process.exit(1);
  }
  runQuery(sql);
}

module.exports = { runQuery, DB };
