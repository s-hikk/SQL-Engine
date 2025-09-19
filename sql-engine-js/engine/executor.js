function getVal(obj, col) {

    return col.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

function evalCond(row, cond) {
  const lhs = getVal(row, cond.column);
  const rhs = cond.value;
  switch (cond.op) {
    case '=': return lhs == rhs;
    case '!=': return lhs != rhs;
    case '>': return lhs > rhs;
    case '<': return lhs < rhs;
    case '>=': return lhs >= rhs;
    case '<=': return lhs <= rhs;
    default: throw new Error('Unsupported operator ' + cond.op);
  }
}

function projectRow(row, columns) {
  if (columns.length === 1 && columns[0] === '*') return row;
  const out = {};
  columns.forEach(c => out[c] = getVal(row, c));
  return out;
}

function executeSelect(query, DB) {
  let rows = DB[query.table];
  if (!rows) throw new Error('Table not found: ' + query.table);
  
  if (query.conditions && query.conditions.length) {
    rows = rows.filter(row => query.conditions.every(cond => evalCond(row, cond)));
  }
  
  rows = rows.map(r => projectRow(r, query.columns));
  if (query.limit) rows = rows.slice(0, query.limit);
  return rows;

}
function innerJoin(leftRows, rightRows, leftKey, rightKey) {
  const map = new Map();
  for (const r of rightRows) {
    const key = r[rightKey];
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  const out = [];
  for (const l of leftRows) {
    const k = l[leftKey];
    const matches = map.get(k);
    if (matches) {
      for (const m of matches) out.push(Object.assign({}, l, m));
    }
  }
  return out;
}

module.exports = { executeSelect, getVal };
