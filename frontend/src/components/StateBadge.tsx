import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  prospectionStateLabel,
  demandeStateLabel,
  suiviStateLabel,
  type ProspectionState,
  type DemandeState,
  type SuiviState,
} from "@/lib/ouvertures-store";

const tone: Record<string, string> = {
  // neutral / progress
  NEW: "bg-slate-100 text-slate-700 border-slate-200",
  DATA_COLLECTION: "bg-slate-100 text-slate-700 border-slate-200",
  PREPARATION: "bg-slate-100 text-slate-700 border-slate-200",
  // in progress
  INTERESTED: "bg-blue-100 text-blue-800 border-blue-200",
  SUBMITTED: "bg-blue-100 text-blue-800 border-blue-200",
  CODIFICATION: "bg-blue-100 text-blue-800 border-blue-200",
  CONTROL: "bg-amber-100 text-amber-800 border-amber-200",
  INSTALLATION: "bg-amber-100 text-amber-800 border-amber-200",
  // success
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  VALIDATED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  LIVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  // negative
  NOT_INTERESTED: "bg-red-100 text-red-800 border-red-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

export function ProspectionBadge({ state }: { state: ProspectionState }) {
  return <Badge variant="outline" className={cn("font-medium", tone[state])}>{prospectionStateLabel[state]}</Badge>;
}
export function DemandeBadge({ state }: { state: DemandeState }) {
  return <Badge variant="outline" className={cn("font-medium", tone[state])}>{demandeStateLabel[state]}</Badge>;
}
export function SuiviBadge({ state }: { state: SuiviState }) {
  return <Badge variant="outline" className={cn("font-medium", tone[state])}>{suiviStateLabel[state]}</Badge>;
}