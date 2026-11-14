import { NextRequest, NextResponse } from "next/server";
import { getVehicles } from "@/lib/vehicles";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const transmission = searchParams.get("transmission") || undefined;
    const fuelType = searchParams.get("fuelType") || undefined;
    const minPrice = searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined;
    const seats = searchParams.get("seats") || undefined;
    const availability = searchParams.get("availability") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const hasPagination = searchParams.has("page") || searchParams.has("limit");
    const isAll = searchParams.get("all") === "true" || !hasPagination;

    const page = searchParams.has("page")
      ? Number(searchParams.get("page"))
      : 1;
    const limit = searchParams.has("limit")
      ? Number(searchParams.get("limit"))
      : 9;
    const featured = searchParams.has("featured")
      ? searchParams.get("featured") === "true"
      : undefined;
    const recommended = searchParams.has("recommended")
      ? searchParams.get("recommended") === "true"
      : undefined;

    const result = await getVehicles({
      category,
      brand,
      transmission,
      fuelType,
      minPrice,
      maxPrice,
      seats,
      availability,
      search,
      sort,
      page,
      limit,
      featured,
      recommended,
      all: isAll,
    });

    return NextResponse.json({
      success: true,
      count: result.vehicles.length,
      pagination: result.pagination,
      data: result.vehicles,
    });
  } catch (error) {
    console.error("GET /api/vehicles error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Araç kataloğu listelenirken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}

