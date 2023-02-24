const sheetId = `1OZf35hceC_sSTTMxFut2467Y7Y2t8oCmMUbF3tNKTes`;
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetTitle = `Semester_1`;
const sheetRangeRow1 = `1:1`;

export const fetchData = async (url: string) => {
  return fetch(url)
    .then((res) => res.text())
    .then((result) => JSON.parse(result.substring(47).slice(0, -2)));
};

export const fetchColNameDict = async () => {
  const url = `${base}&sheet=${sheetTitle}&range=${sheetRangeRow1}`;

  const result = await fetchData(url);
  const colNames = result.table.rows[0].c.map((x: { v: any }) => x.v);

  const dict = colNames.reduce(
    (result: Record<string, string[]>, nextValue: string, index: number) => {
      if (!(nextValue in result)) result[nextValue] = [];
      result[nextValue].push(String.fromCharCode(index + 65));
      return result;
    },
    {}
  );

  return dict;
};

export const fetchStaffNames = async (state: Record<string, any>) => {
  const staffCols = state.colNameDict.Staff;
  const query = `select ${staffCols.join(", ")}`;
  const url = `${base}&sheet=${sheetTitle}&tq=${encodeURIComponent(query)}`;
  const result = await fetchData(url);
  const staffNames = result.table.rows
    .flatMap((x: any) => x.c.flatMap((y: any) => y?.v))
    .filter((z: any) => ![null, undefined].includes(z));
  return staffNames;
};

export const fetchAllocations = async (
  state: Record<string, any>,
  period: string,
  staff: string
) => {
  if (!state.colNameDict || !state.staffNames) return;

  const staffCols = state.colNameDict.Staff;
  const weightCols = state.colNameDict.Weight;
  const allCols = staffCols.flatMap((e: any, i: any) => [e, weightCols[i]]);

  const query =
    staff === "All"
      ? `select ${allCols.join(`, `)}`
      : `select ${allCols.join(`, `)} where ${staffCols.join(
          ` = "${staff}" or `
        )} = "${staff}"`;

  const url = `${base}&sheet=${sheetTitle}&tq=${encodeURIComponent(query)}`;

  const result = await fetchData(url);
  const rows = result.table.rows;

  const allocations = rows.reduce((result: any, nextRow: any) => {
    let lastStaff = "";
    nextRow.c.forEach((cell: any) => {
      if (typeof cell?.v === "string") lastStaff = cell?.v;
      if (!(lastStaff in result)) result[lastStaff] = 0;
      if (typeof cell?.v === "number") result[lastStaff] += cell?.v;
    });
    return result;
  }, {});

  const staffArr = staff === "All" ? state.staffNames : [staff];
  const allocationsFiltered = Object.fromEntries(
    Object.entries(allocations).filter((x) => staffArr.includes(x[0]))
  );

  return allocationsFiltered;
};
