import { createClientFromRequest } from '';

interface OrderRow extends Array<string | number> {}

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlesheets");

    // Get or create spreadsheet
    const settings = await base44.asServiceRole.entities.Setting.filter({ key: "google_sheet_id" });
    let spreadsheetId: string | null = settings.length > 0 ? settings[0].value : null;
    let spreadsheetUrl: string | null = null;

    if (!spreadsheetId) {
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title: 'Festo — Заказы' },
          sheets: [{ properties: { title: 'Orders' } }],
        }),
      });
      const createData = await createRes.json();
      spreadsheetId = createData.spreadsheetId;
      spreadsheetUrl = createData.spreadsheetUrl;

      await base44.asServiceRole.entities.Setting.create({
        key: "google_sheet_id",
        value: spreadsheetId,
      });
    }

    // Get all orders
    const orders = await base44.asServiceRole.entities.Order.list("-date");

    // Build rows
    const headers = [
      "Номер", "Наименование", "Цена",
      "Дата", "ФИО клиента", "Телефон", "Дата доставки",
      "Статус"
    ];
    const rows: OrderRow[] = orders.map((o) => [
      o.order_number ?? "",
      o.order_name ?? "",
      o.price ?? 0,
      o.date ?? "",
      o.client_name ?? "",
      o.client_phone ?? "",
      o.delivery_date ?? "",
      o.status ?? "",
    ]);

    const allRows = [headers, ...rows];

    // Clear the sheet
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Orders!A:Z:clear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Write all data
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Orders!A1?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: "Orders!A1",
        values: allRows,
        majorDimension: "ROWS",
      }),
    });

    // Get spreadsheet URL if not already set
    if (!spreadsheetUrl) {
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const metaData = await metaRes.json();
      spreadsheetUrl = metaData.spreadsheetUrl;
    }

    return Response.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      orderCount: orders.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
});