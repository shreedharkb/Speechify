import { CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function Component() {
  return (
    <Badge className="gap-1" variant="outline">
      <CheckIcon aria-hidden="true" className="text-emerald-600" size={12} />Completed
          </Badge>
  );
}
