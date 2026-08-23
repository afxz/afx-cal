"use client";

import UnitConverter from "@/components/UnitConverter";
import { UNIT_SYSTEMS } from "@/lib/units";

export default function TempTool() {
  return <UnitConverter system={UNIT_SYSTEMS.find((s) => s.id === "temp")!} />;
}
