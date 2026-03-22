"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useExtractionStore } from "@/store/extraction-store";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { StatusBadge } from "@/components/status-badge";
import { CRITICAL_FUNCTION_OPTIONS } from "@/types/extraction";
import type { DoraExtractionFields } from "@/types/extraction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  Hash,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
  Tag,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";

interface FormValues {
  entityName: string;
  leiCode: string;
  criticalFunctionTag: string;
  startDate: string;
  endDate: string;
}

interface FieldConfig {
  key: keyof FormValues;
  label: string;
  icon: React.ElementType;
  placeholder: string;
  type?: "text" | "date" | "select";
  hint?: string;
  pattern?: RegExp;
  patternMsg?: string;
}

const FIELD_CONFIGS: FieldConfig[] = [
  {
    key: "entityName",
    label: "Entity Name",
    icon: User,
    placeholder: "e.g. Amazon Web Services EMEA SARL",
    hint: "Legal name of the ICT third-party provider as registered",
  },
  {
    key: "leiCode",
    label: "LEI Code",
    icon: Hash,
    placeholder: "e.g. 635400KDMFMRBOIFRR33",
    pattern: /^[A-Z0-9]{20}$/,
    patternMsg: "LEI must be exactly 20 alphanumeric characters",
    hint: "20-character Legal Entity Identifier (ISO 17442)",
  },
  {
    key: "criticalFunctionTag",
    label: "Critical Function Tag",
    icon: Tag,
    placeholder: "Select function category",
    type: "select",
    hint: "DORA Art. 28 — classify the ICT service type",
  },
  {
    key: "startDate",
    label: "Contract Start Date",
    icon: CalendarDays,
    placeholder: "",
    type: "date",
    hint: "Effective start date of the contractual arrangement",
  },
  {
    key: "endDate",
    label: "Contract End Date",
    icon: CalendarDays,
    placeholder: "",
    type: "date",
    hint: "Expiry or renewal date of the arrangement",
  },
];

export function ExtractionFormPanel() {
  const {
    document,
    updateField,
    approveDocument,
    rejectDocument,
    saveChanges,
    isSaving,
  } = useExtractionStore();
  const { fields } = document;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      entityName: fields.entityName.value,
      leiCode: fields.leiCode.value,
      criticalFunctionTag: fields.criticalFunctionTag.value,
      startDate: fields.startDate.value,
      endDate: fields.endDate.value,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: FormValues) => {
    (Object.keys(data) as (keyof FormValues)[]).forEach((key) => {
      updateField(key as keyof DoraExtractionFields, data[key]);
    });
    await saveChanges();
    toast.success("Changes saved", {
      description: "Fields updated and recorded in the DORA audit trail.",
    });
    reset(data);
  };

  const handleApprove = () => {
    if (document.status === "approved") return;
    approveDocument();
    toast.success("Document approved", {
      description: `${document.filename} has been approved and added to the register.`,
      action: { label: "View register", onClick: () => {} },
    });
  };

  const handleReject = () => {
    if (document.status === "rejected") return;
    rejectDocument();
    toast.error("Document rejected", {
      description: `${document.filename} has been rejected. It can be re-submitted after corrections.`,
    });
  };

  const handleReset = () => {
    reset({
      entityName: fields.entityName.value,
      leiCode: fields.leiCode.value,
      criticalFunctionTag: fields.criticalFunctionTag.value,
      startDate: fields.startDate.value,
      endDate: fields.endDate.value,
    });
    toast.info("Fields reset to AI-extracted values");
  };

  const handleLeiLookup = () => {
    const lei = watchedValues.leiCode;
    if (!lei) {
      toast.warning("No LEI code entered", { description: "Enter an LEI code before looking it up." });
      return;
    }
    toast.info("Opening GLEIF LEI lookup…", {
      description: `Looking up ${lei} in the GLEIF database.`,
    });
    window.open(`https://www.gleif.org/lei/${lei}`, "_blank", "noopener");
  };

  // Confidence summary
  const allFields = Object.values(fields);
  const avgConfidence = Math.round(
    allFields.reduce((s, f) => s + f.confidence.value, 0) / allFields.length
  );
  const editedCount = allFields.filter((f) => f.isEdited).length;
  const lowConfidenceCount = allFields.filter((f) => f.confidence.level === "low").length;

  return (
    <div className="flex flex-col h-full bg-[#F6F9FC] overflow-y-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4 pb-6">
        {/* Header card */}
        <Card className="border-[#E3E8EF] shadow-none bg-white">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-[#635BFF]/10 flex items-center justify-center">
                  <Bot className="size-4 text-[#635BFF]" />
                </div>
                <div>
                  <CardTitle className="text-[13px] font-semibold text-[#0A2540]">
                    AI Extraction Review
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    DORA Art. 28 — Contractual Arrangements Register
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={document.status} />
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/5 rounded-full px-2 py-0.5 h-auto"
                >
                  DORA AI
                </Badge>
              </div>
            </div>
          </CardHeader>

          <Separator className="bg-[#E3E8EF]" />

          {/* Confidence summary row */}
          <CardContent className="pt-3 pb-4 px-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCell
                icon={ShieldCheck}
                label="Avg. Confidence"
                value={`${avgConfidence}%`}
                valueClass={
                  avgConfidence >= 80
                    ? "text-emerald-600"
                    : avgConfidence >= 60
                    ? "text-amber-600"
                    : "text-red-600"
                }
              />
              <StatCell
                icon={Edit3}
                label="Fields Edited"
                value={`${editedCount} / ${allFields.length}`}
                valueClass="text-[#0A2540]"
              />
              <StatCell
                icon={AlertCircle}
                label="Low Confidence"
                value={`${lowConfidenceCount} fields`}
                valueClass={lowConfidenceCount > 0 ? "text-red-600" : "text-emerald-600"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Extraction fields */}
        <Card className="border-[#E3E8EF] shadow-none bg-white">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">
                Extracted Fields
              </CardTitle>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="size-3" />
                Extracted just now
              </span>
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-4 flex flex-col gap-1">
            {FIELD_CONFIGS.map((cfg, i) => {
              const fieldData = fields[cfg.key as keyof DoraExtractionFields];
              const hasError = !!errors[cfg.key];
              const isEdited = fieldData.isEdited;

              return (
                <div key={cfg.key}>
                  {i > 0 && <Separator className="bg-[#F6F9FC] my-2" />}
                  <FieldRow
                    config={cfg}
                    fieldData={fieldData}
                    hasError={hasError}
                    errorMessage={errors[cfg.key]?.message}
                    isEdited={isEdited}
                    watchedValue={watchedValues[cfg.key]}
                    register={register}
                    setValue={setValue}
                    onLeiLookup={cfg.key === "leiCode" ? handleLeiLookup : undefined}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "flex-1 h-8 text-[12px] font-medium border-[#E3E8EF] transition-colors",
                document.status === "rejected"
                  ? "border-red-300 bg-red-50 text-red-600"
                  : "hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              )}
              onClick={handleReject}
              disabled={document.status === "rejected"}
            >
              <ThumbsDown className="size-3.5 mr-1.5" />
              {document.status === "rejected" ? "Rejected" : "Reject"}
            </Button>
            <Button
              type="button"
              className={cn(
                "flex-1 h-8 text-[12px] font-medium transition-colors",
                document.status === "approved"
                  ? "bg-emerald-700 text-white cursor-default"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
              onClick={handleApprove}
              disabled={document.status === "approved"}
            >
              <ThumbsUp className="size-3.5 mr-1.5" />
              {document.status === "approved" ? "Approved ✓" : "Approve"}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[12px] text-muted-foreground hover:text-[#0A2540]"
              onClick={handleReset}
              disabled={!isDirty}
            >
              <RotateCcw className="size-3 mr-1.5" />
              Reset
            </Button>
            <Button
              type="submit"
              size="sm"
              className="flex-1 h-8 text-[12px] font-medium bg-[#635BFF] hover:bg-[#4F46E5] text-white transition-colors"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="size-3.5 mr-1.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CheckCircle2 className="size-3 text-emerald-500 flex-shrink-0" />
          <span>Changes are recorded in the DORA audit trail.</span>
          <button
            type="button"
            className="ml-auto flex items-center gap-0.5 text-[#635BFF] hover:underline font-medium whitespace-nowrap"
            onClick={() => toast.info("Register view coming soon")}
          >
            View register <ChevronRight className="size-3" />
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

interface FieldRowProps {
  config: FieldConfig;
  fieldData: {
    value: string;
    confidence: import("@/types/extraction").ConfidenceScore;
    isEdited: boolean;
  };
  hasError: boolean;
  errorMessage?: string;
  isEdited: boolean;
  watchedValue: string;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
  onLeiLookup?: () => void;
}

function FieldRow({
  config,
  fieldData,
  hasError,
  errorMessage,
  isEdited,
  watchedValue,
  register,
  setValue,
  onLeiLookup,
}: FieldRowProps) {
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground flex-shrink-0" />
        <label className="text-[12px] font-semibold text-[#0A2540] flex-1">
          {config.label}
        </label>
        <div className="flex items-center gap-1.5">
          {isEdited && (
            <Badge
              variant="outline"
              className="text-[10px] h-auto px-1.5 py-0.5 rounded-full border-[#635BFF]/30 text-[#635BFF] bg-[#635BFF]/5 font-semibold leading-none"
            >
              Edited
            </Badge>
          )}
          <ConfidenceBadge confidence={fieldData.confidence} />
        </div>
      </div>

      {/* Input / select */}
      <div className="relative">
        {config.type === "select" ? (
          <Select
            value={watchedValue}
            onValueChange={(val) =>
              setValue(config.key, val as string, { shouldDirty: true })
            }
          >
            <SelectTrigger
              className={cn(
                "h-8 text-[12px] border-[#E3E8EF] bg-[#F6F9FC] focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-colors",
                hasError && "border-red-400 focus:border-red-400"
              )}
            >
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {CRITICAL_FUNCTION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[12px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex gap-1">
            <Input
              {...register(config.key, {
                required: `${config.label} is required`,
                ...(config.pattern && {
                  pattern: {
                    value: config.pattern,
                    message: config.patternMsg!,
                  },
                }),
              })}
              type={config.type === "date" ? "date" : "text"}
              placeholder={config.placeholder}
              className={cn(
                "h-8 text-[12px] border-[#E3E8EF] bg-[#F6F9FC] placeholder:text-muted-foreground/50 focus-visible:ring-[#635BFF]/30 focus-visible:border-[#635BFF] transition-colors",
                config.key === "leiCode" && "font-mono tracking-wider",
                hasError &&
                  "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/20"
              )}
            />
            {onLeiLookup && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 flex-shrink-0 border-[#E3E8EF] hover:border-[#635BFF]/50 hover:bg-[#635BFF]/5"
                onClick={onLeiLookup}
                title="Look up in GLEIF database"
              >
                <ExternalLink className="size-3 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Error / hint */}
      {hasError ? (
        <p className="text-[11px] text-red-600 flex items-center gap-1">
          <AlertCircle className="size-3 flex-shrink-0" />
          {errorMessage}
        </p>
      ) : config.hint ? (
        <p className="text-[11px] text-muted-foreground/70 leading-snug">{config.hint}</p>
      ) : null}
    </div>
  );
}

function StatCell({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[#E3E8EF] bg-[#F6F9FC] px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
        <Icon className="size-3" />
        {label}
      </div>
      <span className={cn("text-[15px] font-bold tabular-nums leading-none", valueClass)}>
        {value}
      </span>
    </div>
  );
}
