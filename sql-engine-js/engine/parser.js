function parseWhereAnd(whereStr) {
  if (!whereStr) return [];
  return whereStr.split(/\s+AND\s+/i).map(condStr => {
    condStr = condStr.trim();
    const re = /^([a-zA-Z0-9_\.]+)\s*(=|!=|>=|<=|>|<)\s*('([^']*)'|"([^"]*)"|[0-9]+(?:\.[0-9]+)?)$/;
    const m = condStr.match(re);
    if (!m) throw new Error('Unsupported WHERE clause: ' + condStr);
    const rawVal = (m[4] !== undefined) ? m[4] : ((m[5] !== undefined) ? m[5] : m[3]);
    const value = /^-?\d+(\.\d+)?$/.test(rawVal) ? Number(rawVal) : rawVal;
    return { column: m[1], op: m[2], value };
  });
}

function parseSimpleSQL(sql) {
  if (!sql || typeof sql !== 'string') throw new Error('SQL must be a string');
  sql = sql.trim().replace(/\s+/g, ' ');
  const re = /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+LIMIT\s+(\d+))?;?$/i;
  const m = sql.match(re);
  if (!m) throw new Error('Invalid or unsupported SQL. Example supported: SELECT a,b FROM table WHERE col = \'X\' LIMIT 10');
  const colsRaw = m[1].trim();
  const columns = (colsRaw === '*') ? ['*'] : colsRaw.split(',').map(s => s.trim());
  const table = m[2].trim();
  const whereStr = m[3] ? m[3].trim() : null;
  const limit = m[4] ? parseInt(m[4], 10) : null;
  const conditions = parseWhereAnd(whereStr);
  return { type: 'select', columns, table, conditions, limit };
}

module.exports = { parseSimpleSQL };
