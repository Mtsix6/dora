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
