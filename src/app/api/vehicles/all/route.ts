import { NextResponse } from "next/server";
import { getAllVehicles } from "@/lib/vehicles";

/**
 * Dedicated endpoint: GET /api/vehicles/all
 * Returns the entire vehicle fleet without any filtering or pagination restrictions.
 */
export async function GET() {
  try {
    const vehicles = await getAllVehicles();

    return NextResponse.json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error("GET /api/vehicles/all error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Tüm araçlar listelenirken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}

