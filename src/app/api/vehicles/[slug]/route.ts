import { NextRequest, NextResponse } from "next/server";
import { getVehicleBySlug } from "@/lib/vehicles";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug parametresi zorunludur" },
        { status: 400 }
      );
    }

    const vehicle = await getVehicleBySlug(slug);

    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          error: `'${slug}' tanımlayıcısına sahip araç bulunamadı`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("GET /api/vehicles/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Araç detayları alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

