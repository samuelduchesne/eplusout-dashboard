// Generate a small eplusout.sql SQLite database compatible with the dashboard
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(`
CREATE TABLE IF NOT EXISTS ReportDataDictionary (
  ReportDataDictionaryIndex INTEGER PRIMARY KEY,
  KeyValue TEXT,
  Name TEXT,
  ReportingFrequency TEXT,
  IndexGroup TEXT,
  Units TEXT,
  IsMeter INTEGER,
  Type TEXT
);
CREATE TABLE IF NOT EXISTS Time (
  TimeIndex INTEGER PRIMARY KEY,
  EnvironmentPeriodIndex INTEGER,
  SimulationDays INTEGER,
  Month INTEGER,
  Day INTEGER,
  Hour INTEGER,
  Minute INTEGER,
  IntervalType TEXT
);
CREATE TABLE IF NOT EXISTS ReportData (
  ReportDataIndex INTEGER PRIMARY KEY,
  ReportDataDictionaryIndex INTEGER,
  TimeIndex INTEGER,
  Value REAL
);
CREATE TABLE IF NOT EXISTS TabularDataWithStrings (
  ReportName TEXT,
  TableName TEXT,
  RowName TEXT,
  ColumnName TEXT,
  Value TEXT,
  Units TEXT,
  ReportForString TEXT
);
  `);
  db.run(`INSERT INTO Time(TimeIndex,EnvironmentPeriodIndex,SimulationDays,Month,Day,Hour,Minute,IntervalType) VALUES
 (1,1,1,1,1,1,0,'H'),(2,1,1,1,1,2,0,'H'),(3,1,1,1,1,3,0,'H'),(4,1,1,1,1,4,0,'H');`);
  db.run(`INSERT INTO ReportDataDictionary(ReportDataDictionaryIndex,KeyValue,Name,ReportingFrequency,IndexGroup,Units,IsMeter,Type) VALUES
 (1,'Entire Facility','Electricity:Facility','Hourly','Meters','J',1,'Sum'),
 (2,'Zone One','Zone Air Temperature','Hourly','Zone','C',0,'Average');`);
  db.run(`INSERT INTO ReportData(ReportDataIndex,ReportDataDictionaryIndex,TimeIndex,Value) VALUES
 (1,1,1,3600000.0),(2,1,2,4100000.0),(3,1,3,3900000.0),(4,1,4,4200000.0),
 (5,2,1,21.5),(6,2,2,21.9),(7,2,3,22.1),(8,2,4,22.0);`);

  const data = db.export();
  const buffer = Buffer.from(data);
  const targets = [path.resolve(__dirname, '..', 'public', 'assets', 'eplusout.sql')];
  for (const outFile of targets) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, buffer);
  }
  console.log(`[sample] wrote ${targets.length} files (${buffer.length} bytes)`);
})();
