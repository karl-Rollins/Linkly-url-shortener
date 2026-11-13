function escapeCsv(value) {
  if (value === null || value === undefined) {
    return "";
  }

  let stringValue = String(value);

  // Spreadsheet formula injection

  if (/^[=+\-@]/.test(stringValue)) {
    stringValue = `'${stringValue}`;
  }

  return `"${stringValue.replaceAll('"', '""')}"`;
}

// export function clicksToCsvRow(clicks) {
//   const header =
//     "id,referrer,user_agent,clicked_at";

//   const rows = clicks.map((click) =>
//     [
//       escapeCsv(click.id),
//       escapeCsv(click.referrer),
//       escapeCsv(click.user_agent),
//       escapeCsv(
//         click.clicked_at instanceof Date
//           ? click.clicked_at.toISOString()
//           : click.clicked_at,
//       ),
//     ].join(","),
//   );

//   return [header, ...rows].join("\n");
// }

export function clicksToCsvRow(click) {
  return (
    [
      escapeCsv(click.id),
      escapeCsv(click.referrer),
      escapeCsv(click.user_agent),
      escapeCsv(
        click.clicked_at instanceof Date
          ? click.clicked_at.toISOString()
          : click.clicked_at,
      ),
    ].join(",") + "\n"
  );
}
