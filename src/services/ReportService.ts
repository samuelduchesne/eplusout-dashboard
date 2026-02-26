import type { Series } from '../types/domain';

export class ReportService {
  buildCsv(series: Series[]): string {
    if (!series.length) return '';
    const header = ['series_id', 'series_name', 'x', 'x_label', 'y'];
    const rows = series.flatMap((s) =>
      s.points.map((p) => [
        String(s.id),
        s.meta.Name,
        String(p.x ?? ''),
        String(p.xLabel ?? ''),
        String(p.y),
      ]),
    );
    return [header, ...rows]
      .map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(','))
      .join('\n');
  }
}
