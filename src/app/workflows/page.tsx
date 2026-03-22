"use client";

import { useCallback } from "react";
import { GitBranch, Save, Settings, PlayCircle, Bot } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "trigger",
    type: "input",
    data: { label: "Major Incident Detected" },
    position: { x: 250, y: 50 },
    className:
      "bg-[#0A2540] text-white border-none font-bold shadow-lg rounded-xl px-4 py-3 min-w-[200px] text-center",
  },
  {
    id: "ai-classify",
    data: { label: "DORA AI: Impact Classification" },
    position: { x: 250, y: 150 },
    className:
      "bg-gradient-to-r from-[#635BFF] to-[#4F46E5] text-white border-none font-semibold shadow-md rounded-xl px-4 py-3 min-w-[200px] text-center",
  },
  {
    id: "logic-split",
    data: { label: "Is Critical?" },
    position: { x: 250, y: 250 },
    className:
      "bg-white text-[#0A2540] border-2 border-[#E3E8EF] font-bold shadow-sm rounded-full px-4 py-3 w-[120px] h-[120px] flex items-center justify-center text-center",
  },
  {
    id: "notify-board",
    type: "output",
    data: { label: "Alert Board & NCA (Art. 19)" },
    position: { x: 100, y: 400 },
    className:
      "bg-red-50 text-red-700 border border-red-200 font-bold shadow-sm rounded-xl px-4 py-3 min-w-[180px] text-center",
  },
  {
    id: "log-internal",
    type: "output",
    data: { label: "Log to Internal Register" },
    position: { x: 400, y: 400 },
    className:
      "bg-[#F6F9FC] text-[#0A2540] border border-[#E3E8EF] font-medium shadow-sm rounded-xl px-4 py-3 min-w-[180px] text-center",
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "trigger",
    target: "ai-classify",
    animated: true,
    style: { stroke: "#635BFF", strokeWidth: 2 },
  },
  {
    id: "e2-3",
    source: "ai-classify",
    target: "logic-split",
    style: { stroke: "#635BFF", strokeWidth: 2 },
  },
  {
    id: "e3-4",
    source: "logic-split",
    target: "notify-board",
    label: "Yes",
    animated: true,
    style: { stroke: "#EF4444", strokeWidth: 2 },
    labelStyle: { fill: "#EF4444", fontWeight: 700 },
  },
  {
    id: "e3-5",
    source: "logic-split",
    target: "log-internal",
    label: "No",
    style: { stroke: "#9CA3AF", strokeWidth: 2 },
    labelStyle: { fill: "#6B7280", fontWeight: 600 },
  },
];

export default function WorkflowsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleSave = () => {
    toast.success("Workflow Saved Successfully", {
      description: "Incident Response Automation plan updated.",
    });
  };

  return (
    <AppShell noPad>
      <div className="flex flex-col h-full">
        {/* Page header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E3E8EF] bg-white">
          <div className="flex items-center gap-2">
            <GitBranch className="size-5 text-[#635BFF]" />
            <h1 className="text-xl font-bold text-[#0A2540] tracking-tight">
              Automation Workflows
            </h1>
          </div>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Visual, node-based automation for Incident Response, Policy Approvals, and Vendor Reviews.
          </p>
        </div>

        {/* Workflow canvas */}
        <div className="flex-1 min-h-0 relative">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E8EF] bg-white z-10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-[#0A2540]">
                  Major ICT Incident Workflow
                </h3>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] py-0"
                >
                  ACTIVE
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Automates Art. 19 classification and notification.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[12px] border-[#E3E8EF] text-[#0A2540]"
              >
                <Settings className="size-3.5 mr-1.5" /> Configure
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="h-8 text-[12px] bg-[#635BFF] hover:bg-[#4F46E5] text-white"
              >
                <Save className="size-3.5 mr-1.5" /> Save Workflow
              </Button>
            </div>
          </div>

          {/* ReactFlow */}
          <div className="flex-1 absolute inset-0 top-[60px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              className="bg-[#F6F9FC]/50"
            >
              <Controls className="bg-white border-[#E3E8EF] shadow-sm rounded-lg" />
              <MiniMap
                nodeColor={(node) => {
                  if (node.type === "input") return "#0A2540";
                  if (node.id === "ai-classify") return "#635BFF";
                  if (node.id === "notify-board") return "#EF4444";
                  return "#E3E8EF";
                }}
                maskColor="rgba(246, 249, 252, 0.7)"
                className="bg-white border-[#E3E8EF] shadow-sm rounded-lg"
              />
              <Background
                variant={BackgroundVariant.Dots}
                gap={16}
                size={1}
                color="#CBD5E1"
              />
            </ReactFlow>

            {/* Floating Tool Panel */}
            <div className="absolute left-4 top-4 bg-white border border-[#E3E8EF] rounded-xl shadow-lg p-3 w-48 z-10">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Add Node
              </p>
              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-2 text-[12px] font-medium text-[#0A2540] hover:text-[#635BFF] transition-colors p-1.5 hover:bg-[#635BFF]/5 rounded-md text-left w-full border border-dashed border-transparent hover:border-[#635BFF]/30">
                  <div className="size-6 rounded bg-[#0A2540] flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="size-3 text-white" />
                  </div>{" "}
                  Trigger
                </button>
                <button className="flex items-center gap-2 text-[12px] font-medium text-[#0A2540] hover:text-[#635BFF] transition-colors p-1.5 hover:bg-[#635BFF]/5 rounded-md text-left w-full border border-dashed border-transparent hover:border-[#635BFF]/30">
                  <div className="size-6 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="size-3 text-emerald-600" />
                  </div>{" "}
                  AI Action
                </button>
                <button className="flex items-center gap-2 text-[12px] font-medium text-[#0A2540] hover:text-[#635BFF] transition-colors p-1.5 hover:bg-[#635BFF]/5 rounded-md text-left w-full border border-dashed border-transparent hover:border-[#635BFF]/30">
                  <div className="size-6 rounded bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <GitBranch className="size-3 text-amber-600" />
                  </div>{" "}
                  Logic Split
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
