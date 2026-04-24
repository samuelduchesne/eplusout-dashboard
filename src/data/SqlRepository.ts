import { QueryError } from '../services/errors';
import type { DictionaryEntry } from '../types/domain';

interface SqlJsDatabase {
  exec: (sql: string) => Array<{ columns: string[]; values: unknown[][] }>;
}

export class SqlRepository {
  constructor(private readonly db: SqlJsDatabase) {}

  queryDictionary(): DictionaryEntry[] {
    try {
      const sql = `
SELECT ReportDataDictionaryIndex AS id, IsMeter, Type, IndexGroup, KeyValue AS key,
       Name,
       CASE WHEN ReportingFrequency LIKE '%Timestep'
            THEN 'Timestep'
            ELSE ReportingFrequency END AS freq,
       Units
FROM ReportDataDictionary
WHERE ReportingFrequency IN ('Zone Timestep','HVAC System Timestep','Hourly','Monthly')
ORDER BY IsMeter DESC, IndexGroup, Name, key;`;
      const result = this.db.exec(sql);
      const first = result[0];
      if (!first) return [];
      return first.values.map((row) => {
        const obj: Record<string, unknown> = {};
        first.columns.forEach((c, i) => {
          obj[c] = row[i];
        });
        return obj as unknown as DictionaryEntry;
      });
    } catch (error) {
      throw new QueryError('Failed to query dictionary', { error });
    }
  }
}
