// Generate a small eplusout.sql SQLite database compatible with the dashboard
// Uses sql.js (pure WASM, no native sqlite3 needed)
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
  // Seed a few hours
  db.run(`INSERT INTO Time(TimeIndex,EnvironmentPeriodIndex,SimulationDays,Month,Day,Hour,Minute,IntervalType) VALUES
 (1,1,1,1,1,1,0,'H'),(2,1,1,1,1,2,0,'H'),(3,1,1,1,1,3,0,'H'),(4,1,1,1,1,4,0,'H');`);
  db.run(`INSERT INTO ReportDataDictionary(ReportDataDictionaryIndex,KeyValue,Name,ReportingFrequency,IndexGroup,Units,IsMeter,Type) VALUES
 (1,'Entire Facility','Electricity:Facility','Hourly','Meters','J',1,'Sum'),
 (2,'Zone One','Zone Air Temperature','Hourly','Zone','C',0,'Average');`);
  db.run(`INSERT INTO ReportData(ReportDataIndex,ReportDataDictionaryIndex,TimeIndex,Value) VALUES
 (1,1,1,3600000.0),(2,1,2,4100000.0),(3,1,3,3900000.0),(4,1,4,4200000.0),
 (5,2,1,21.5),(6,2,2,21.9),(7,2,3,22.1),(8,2,4,22.0);`);
  // Tabulars
  db.run(`INSERT INTO TabularDataWithStrings(ReportName,TableName,RowName,ColumnName,Value,Units,ReportForString) VALUES
 ('AnnualBuildingUtilityPerformanceSummary','Building Area','Total Building Area','Area','1000','m2','Entire Facility');`);
  db.run(`INSERT INTO TabularDataWithStrings(ReportName,TableName,RowName,ColumnName,Value,Units,ReportForString) VALUES
 ('AnnualBuildingUtilityPerformanceSummary','End Uses','Heating','Electricity','1.2e7','J','Entire Facility'),
 ('AnnualBuildingUtilityPerformanceSummary','End Uses','Cooling','Electricity','8.0e6','J','Entire Facility');`);
  db.run(`INSERT INTO TabularDataWithStrings(ReportName,TableName,RowName,ColumnName,Value,Units,ReportForString) VALUES
 ('AnnualBuildingUtilityPerformanceSummary','End Uses By Subcategory','Interior Lighting','General Lighting','2.5e6','J','Entire Facility'),
 ('AnnualBuildingUtilityPerformanceSummary','End Uses By Subcategory','Interior Equipment','Plugs','3.1e6','J','Entire Facility');`);
  db.run(`INSERT INTO TabularDataWithStrings(ReportName,TableName,RowName,ColumnName,Value,Units,ReportForString) VALUES
 ('HVACSizingSummary','Coil Sizing Summary','Coil Heating 1','Nominal Capacity','5000','W','Entire Facility'),
 ('HVACSizingSummary','Coil Sizing Summary','Coil Cooling 1','Nominal Total Capacity','10000','W','Entire Facility'),
 ('HVACSizingSummary','Plant Loop Coincident Design Fluid Flow Rate Adjustments','Heating Loop','Adjusted Design Flow Rate','0.05','m3/s','Entire Facility');`);
  db.run(`INSERT INTO TabularDataWithStrings(ReportName,TableName,RowName,ColumnName,Value,Units,ReportForString) VALUES
 ('ComponentSizingSummary','AirTerminal:SingleDuct:VAV:Reheat','VAV Reheat 1','Maximum Air Flow Rate','0.7','m3/s','Entire Facility'),
 ('ComponentSizingSummary','Fan:VariableVolume','Supply Fan 1','Maximum Flow Rate','1.2','m3/s','Entire Facility');`);

  const data = db.export();
  const buffer = Buffer.from(data);
  const outDir = path.resolve(__dirname, '..', 'assets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'eplusout.sql');
  fs.writeFileSync(outFile, buffer);
  console.log(`[sample] wrote ${path.relative(process.cwd(), outFile)} (${buffer.length} bytes)`);
})();
