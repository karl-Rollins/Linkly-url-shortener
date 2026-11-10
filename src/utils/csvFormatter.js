function escapeCsv(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return `"${String(value).replaceAll('"', '""')}"`;
}

export function clicksToCsv(clicks) {
  const header =
    "id,referrer,user_agent,clicked_at";

  const rows = clicks.map((click) =>
    [
      escapeCsv(click.id),
      escapeCsv(click.referrer),
      escapeCsv(click.user_agent),
      escapeCsv(
        click.clicked_at instanceof Date
          ? click.clicked_at.toISOString()
          : click.clicked_at,
      ),
    ].join(","),
  );

  return [header, ...rows].join("\n");
}