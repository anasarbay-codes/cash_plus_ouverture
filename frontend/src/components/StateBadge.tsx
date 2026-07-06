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
  new: "bg-slate-100 text-slate-700 border-slate-200",
  data_collection: "bg-slate-100 text-slate-700 border-slate-200",
  preparation: "bg-slate-100 text-slate-700 border-slate-200",
  // in progress
  interested: "bg-blue-100 text-blue-800 border-blue-200",
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  codification: "bg-blue-100 text-blue-800 border-blue-200",
  control: "bg-amber-100 text-amber-800 border-amber-200",
  installation: "bg-amber-100 text-amber-800 border-amber-200",
  // success
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  validated: "bg-emerald-100 text-emerald-800 border-emerald-200",
  live: "bg-emerald-100 text-emerald-800 border-emerald-200",
  // negative
  not_interested: "bg-red-100 text-red-800 border-red-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
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