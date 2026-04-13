  // TODO (Jules): [Scalability] Heavy logic: As datasets grow, client-side CSV generation will block the main thread and crash the browser. Move this generation to a Cloud Run backend or Web Worker.
export function exportToCsv(filename: string, rows: any[][]): void {
  const processRow = (row: any[]) => {
    return row.map(val => {
      if (val === null || val === undefined) {
        return '""';
      }
      let stringVal = val.toString();
      // Escape double quotes by doubling them
      stringVal = stringVal.replace(/"/g, '""');
      // If the value contains a comma, newline, or double quote, wrap it in double quotes
      if (stringVal.search(/("|,|\n)/g) >= 0) {
        stringVal = `"${stringVal}"`;
      }
      return stringVal;
    }).join(',');
  };

  const csvContent = rows.map(processRow).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
