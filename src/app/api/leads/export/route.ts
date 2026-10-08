import ExcelJS from "exceljs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIME_ZONE } from "@/config/social";

function formatDate(date: Date) {
  // "2026-10-07 18:30" en la zona horaria configurada (ordena bien como texto)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Daely";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Registros", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "#", key: "n", width: 6 },
    { header: "Nombre", key: "name", width: 30 },
    { header: "Teléfono", key: "phone", width: 20 },
    { header: "Correo", key: "email", width: 36 },
    { header: "Instagram", key: "instagram", width: 24 },
    { header: "Fecha de registro", key: "createdAt", width: 20 },
  ];

  leads.forEach((lead, i) => {
    sheet.addRow({
      n: leads.length - i,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      instagram: lead.instagram ? `@${lead.instagram}` : "",
      createdAt: formatDate(lead.createdAt),
    });
  });

  const header = sheet.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111111" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F3F3" } };
      });
    }
  });

  sheet.autoFilter = { from: "A1", to: "F1" };

  const buffer = await workbook.xlsx.writeBuffer();
  const stamp = formatDate(new Date()).slice(0, 10);

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="registros-daely-${stamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
