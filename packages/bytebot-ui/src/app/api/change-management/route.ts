import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";

import { getChangeProgram } from "@/lib/change-management-store";

export async function GET() {
  noStore();
  try {
    const program = await getChangeProgram();
    return NextResponse.json(program);
  } catch (error) {
    console.error("Error obteniendo el programa de cambio", error);
    return NextResponse.json(
      { error: "No fue posible cargar la información del programa" },
      { status: 500 },
    );
  }
}
