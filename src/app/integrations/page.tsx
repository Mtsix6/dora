import { AppShell } from "@/components/app-shell";
import {
  Plug,
  Search,
  ExternalLink,
  CheckCircle2,
  Zap,
  Globe,
  Lock,
  MessageSquare,
  BarChart3,
  Shield,
  Bell,
  BookOpen,
  Cloud,
  Bug,
  FileSignature,
  Scale,
  Activity,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IntegrationClient } from "./IntegrationClient";

export const dynamic = "force-dynamic";

const INTEGRATION_METADATA = [
  { 
    id: "slack", 
    name: "Slack", 
    description: "Receive real-time compliance alerts and incident notifications via Slack channels.", 
    category: "Communication", 
    icon: <MessageSquare className="size-6 text-[#4A154B]" /> 
  },
  { 
    id: "msteams", 
    name: "Microsoft Teams", 
    description: "Integrate DORA alerts directly into your organization's Teams workspace.", 
    category: "Communication", 
    icon: <Globe className="size-6 text-[#6264A7]" /> 
  },
  { 
    id: "jira", 
    name: "Jira Software", 
    description: "Automatically create and track compliance remediation tasks as Jira issues.", 
    category: "Project Management", 
    icon: <BarChart3 className="size-6 text-[#0052CC]" /> 
  },
  { 
    id: "servicenow", 
    name: "ServiceNow", 
    description: "Sync DORA incidents with ServiceNow ITSM for enterprise-scale handling.", 
    category: "IT Operations", 
    icon: <Plug className="size-6 text-[#81B5A1]" /> 
  },
  { 
    id: "github", 
    name: "GitHub", 
    description: "Scan repositories for compliance in code and infrastructure-as-code files.", 
    category: "Security", 
    icon: <Globe className="size-6 text-[#181717]" /> 
  },
  { 
    id: "aws", 
    name: "Amazon Web Services", 
    description: "Auto-discovery of ICT assets and real-time security configuration monitoring.", 
    category: "Cloud", 
    icon: <Globe className="size-6 text-[#FF9900]" /> 
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    description: "Direct integration with Azure Policy and Security Center for unified compliance.",
    category: "Cloud",
    icon: <Globe className="size-6 text-[#0089D6]" />
  },
  {
    id: "splunk",
    name: "Splunk",
    description: "Stream DORA incident logs to Splunk SIEM for centralized security monitoring and threat detection.",
    category: "Security",
    icon: <Shield className="size-6 text-[#65A637]" />
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    description: "Escalate critical DORA incidents automatically with PagerDuty's on-call rotation and alerting.",
    category: "IT Operations",
    icon: <Bell className="size-6 text-[#06AC38]" />
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Auto-publish compliance documentation and policy updates to your Confluence knowledge base.",
    category: "Documentation",
    icon: <BookOpen className="size-6 text-[#172B4D]" />
  },
  {
    id: "gcloud",
    name: "Google Cloud",
    description: "Monitor GCP infrastructure, enforce compliance policies, and auto-discover ICT assets.",
    category: "Cloud",
    icon: <Cloud className="size-6 text-[#4285F4]" />
  },
  {
    id: "qualys",
    name: "Qualys",
    description: "Import vulnerability scan results for ICT asset risk scoring and DORA Art. 9 compliance.",
    category: "Security",
    icon: <Bug className="size-6 text-[#ED2024]" />
  },
  {
    id: "docusign",
    name: "DocuSign",
    description: "Track contract signatures, expiry dates, and renewal workflows for vendor management.",
    category: "Legal",
    icon: <FileSignature className="size-6 text-[#FFD301]" />
  },
  {
    id: "sapgrc",
    name: "SAP GRC",
    description: "Bidirectional sync with SAP Governance, Risk and Compliance for enterprise DORA alignment.",
    category: "Governance",
    icon: <Scale className="size-6 text-[#0FAAFF]" />
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Correlate application performance data with DORA resilience testing and incident classification.",
    category: "Observability",
    icon: <Activity className="size-6 text-[#632CA6]" />
  },
];

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) redirect("/login");

  const workspaceId = session.user.workspaceId;
  const dbIntegrations = await prisma.integration.findMany({
    where: { workspaceId },
  });

  const integrations = INTEGRATION_METADATA.map(meta => {
    const connected = dbIntegrations.find(db => db.provider === meta.id);
    return {
      ...meta,
      status: connected ? "Connected" : (meta.id === "servicenow" ? "Enterprise Only" : "Available"),
    };
  });

  return (
    <AppShell>
      <IntegrationClient initialIntegrations={integrations} />
    </AppShell>
  );
}
