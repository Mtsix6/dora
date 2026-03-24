import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ── Helpers ─────────────────────────────────────────────────────

function escapeCSV(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: string[][]): string {
  const lines = [headers.map(escapeCSV).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCSV).join(","));
  }
  return lines.join("\r\n");
}

// ── Generators per report type ──────────────────────────────────

async function generateComplianceSummary(workspaceId: string) {
  const checks = await prisma.complianceCheck.findMany({
    where: { workspaceId },
    orderBy: { pillar: "asc" },
    include: { assignee: { select: { name: true } } },
  });

  const headers = [
    "Pillar",
    "Requirement",
    "Article",
    "Status",
    "Assignee",
    "Due Date",
    "Completed At",
    "Notes",
  ];

  const rows = checks.map((c) => [
    c.pillar,
    c.requirement,
    c.article,
    c.status,
    c.assignee?.name ?? "",
    c.dueDate?.toISOString().split("T")[0] ?? "",
    c.completedAt?.toISOString().split("T")[0] ?? "",
    c.notes ?? "",
  ]);

  // Append summary section
  const pillars = [...new Set(checks.map((c) => c.pillar))];
  rows.push([]);
  rows.push(["--- SUMMARY ---", "", "", "", "", "", "", ""]);
  rows.push(["Pillar", "Total", "Compliant", "Non-Compliant", "In Progress", "Not Started", "", ""]);
  for (const pillar of pillars) {
    const pillarChecks = checks.filter((c) => c.pillar === pillar);
    rows.push([
      pillar,
      String(pillarChecks.length),
      String(pillarChecks.filter((c) => c.status === "Compliant").length),
      String(pillarChecks.filter((c) => c.status === "Non-Compliant").length),
      String(pillarChecks.filter((c) => c.status === "In Progress").length),
      String(pillarChecks.filter((c) => c.status === "Not Started").length),
      "",
      "",
    ]);
  }

  return toCSV(headers, rows);
}

async function generateIncidentReport(workspaceId: string) {
  const incidents = await prisma.incident.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: { reportedBy: { select: { name: true } } },
  });

  const headers = [
    "ID",
    "Title",
    "Severity",
    "Status",
    "Reported By",
    "Description",
    "Created At",
    "Resolved At",
  ];

  const rows = incidents.map((i) => [
    i.id,
    i.title,
    i.severity,
    i.status,
    i.reportedBy?.name ?? "",
    i.description ?? "",
    i.createdAt.toISOString().split("T")[0],
    i.resolvedAt?.toISOString().split("T")[0] ?? "",
  ]);

  // Summary
  rows.push([]);
  rows.push(["--- SUMMARY ---", "", "", "", "", "", "", ""]);
  rows.push(["Severity", "Count", "Open", "Resolved", "", "", "", ""]);
  const severities = [...new Set(incidents.map((i) => i.severity))];
  for (const sev of severities) {
    const group = incidents.filter((i) => i.severity === sev);
    rows.push([
      sev,
      String(group.length),
      String(group.filter((i) => i.status !== "Resolved" && i.status !== "Closed").length),
      String(group.filter((i) => i.status === "Resolved" || i.status === "Closed").length),
      "",
      "",
      "",
      "",
    ]);
  }

  return toCSV(headers, rows);
}

async function generateRiskAssessment(workspaceId: string) {
  const assets = await prisma.ictAsset.findMany({
    where: { workspaceId },
    orderBy: { riskScore: "desc" },
  });

  const headers = [
    "ID",
    "Name",
    "Category",
    "Criticality",
    "Risk Score",
    "Last Assessed",
    "Created At",
  ];

  const rows = assets.map((a) => [
    a.id,
    a.name,
    a.category,
    a.criticality,
    a.riskScore != null ? String(a.riskScore) : "",
    a.lastAssessedAt?.toISOString().split("T")[0] ?? "",
    a.createdAt.toISOString().split("T")[0],
  ]);

  // Summary
  rows.push([]);
  rows.push(["--- SUMMARY ---", "", "", "", "", "", ""]);
  rows.push(["Criticality", "Count", "Avg Risk Score", "", "", "", ""]);
  const criticalities = [...new Set(assets.map((a) => a.criticality))];
  for (const crit of criticalities) {
    const group = assets.filter((a) => a.criticality === crit);
    const scores = group.map((a) => a.riskScore).filter((s): s is number => s != null);
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "N/A";
    rows.push([crit, String(group.length), avg, "", "", "", ""]);
  }

  return toCSV(headers, rows);
}

async function generateVendorAudit(workspaceId: string) {
  const vendors = await prisma.vendor.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
  });

  const headers = [
    "ID",
    "Name",
    "Category",
    "Criticality",
    "Status",
    "Next Review",
    "Created At",
  ];

  const rows = vendors.map((v) => [
    v.id,
    v.name,
    v.category,
    v.criticality,
    v.status,
    v.nextReviewAt?.toISOString().split("T")[0] ?? "",
    v.createdAt.toISOString().split("T")[0],
  ]);

  // Summary
  rows.push([]);
  rows.push(["--- SUMMARY ---", "", "", "", "", "", ""]);
  rows.push(["Status", "Count", "", "", "", "", ""]);
  const statuses = [...new Set(vendors.map((v) => v.status))];
  for (const status of statuses) {
    rows.push([status, String(vendors.filter((v) => v.status === status).length), "", "", "", "", ""]);
  }

  return toCSV(headers, rows);
}

// ── Route handler ───────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const report = await prisma.report.findFirst({
    where: { id, workspaceId: session.user.workspaceId },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  let csv: string;
  const workspaceId = session.user.workspaceId;

  switch (report.type) {
    case "compliance_summary":
      csv = await generateComplianceSummary(workspaceId);
      break;
    case "incident_report":
      csv = await generateIncidentReport(workspaceId);
      break;
    case "risk_assessment":
      csv = await generateRiskAssessment(workspaceId);
      break;
    case "vendor_audit":
      csv = await generateVendorAudit(workspaceId);
      break;
    default:
      // Fallback: generate compliance summary for unknown types
      csv = await generateComplianceSummary(workspaceId);
      break;
  }

  const safeTitle = report.title.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${safeTitle}_${report.createdAt.toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
