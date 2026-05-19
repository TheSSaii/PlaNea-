// backend/src/places/places.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetPlacesQueryDto } from './dto/get-places-query.dto';
import { PlaceStatus, Prisma } from '@prisma/client';
 
@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}
 
  async findAll(query: GetPlacesQueryDto) {
    const {
      search,
      categories,
      interests,
      priceLevel,
      lat,
      lng,
      radiusKm,
      limit = 50,
      offset = 0,
    } = query;
 
    const categoryIds = categories
      ? categories.split(',').filter(Boolean)
      : [];
 
    const interestIds = interests
      ? interests.split(',').filter(Boolean)
      : [];
 
    const where: Prisma.PlaceWhereInput = {
      // Show usable places on the map. New places created in Prisma Studio
      // default to PENDING, so keep them visible while hiding rejected/blocked.
      status: { in: [PlaceStatus.ACTIVE, PlaceStatus.PENDING] },
 
      // Text search across name, description, address
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
 
      // Filter by categories (place must have ALL selected categories)
      ...(categoryIds.length > 0 && {
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
      }),
 
      // Filter by interests
      ...(interestIds.length > 0 && {
        interests: {
          some: {
            interestId: { in: interestIds },
          },
        },
      }),
 
      // Filter by price level
      ...(priceLevel && { priceLevel }),
 
      // Only places that have coordinates (needed for map rendering)
      latitude: { not: null },
      longitude: { not: null },
    };
 
    const places = await this.prisma.place.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        priceLevel: true,
        avgCostCents: true,
        openingHoursText: true,
        phone: true,
        websiteUrl: true,
        photos: {
          select: { url: true, position: true },
          orderBy: { position: 'asc' },
          take: 1,
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true },
            },
          },
        },
        interests: {
          select: {
            interest: {
              select: { id: true, name: true },
            },
          },
        },
        reviews: {
          select: { rating: true },
        },
        _count: {
          select: {
            reviews: true,
            favorites: true,
            checkIns: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
    });
 
    // Compute average rating and apply distance filter in-memory
    // (For production, use PostGIS for geo queries)
    const enriched = places
      .map((p) => {
        const avgRating =
          p.reviews.length > 0
            ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
            : null;
 
        let distanceKm: number | null = null;
        if (lat != null && lng != null && p.latitude && p.longitude) {
          distanceKm = this.haversineKm(lat, lng, p.latitude, p.longitude);
        }
 
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          address: p.address,
          latitude: p.latitude,
          longitude: p.longitude,
          priceLevel: p.priceLevel,
          avgCostCents: p.avgCostCents,
          openingHoursText: p.openingHoursText,
          phone: p.phone,
          websiteUrl: p.websiteUrl,
          coverPhoto: p.photos[0]?.url ?? null,
          categories: p.categories.map((c) => c.category),
          interests: p.interests.map((i) => i.interest),
          avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
          reviewCount: p._count.reviews,
          favoriteCount: p._count.favorites,
          checkInCount: p._count.checkIns,
          distanceKm,
        };
      })
      // Apply radius filter if coordinates provided
      .filter((p) => {
        if (lat != null && lng != null && radiusKm != null && p.distanceKm != null) {
          return p.distanceKm <= radiusKm;
        }
        return true;
      })
      // Sort by distance when geo filter is active
      .sort((a, b) => {
        if (a.distanceKm != null && b.distanceKm != null) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });
 
    return {
      data: enriched,
      total: enriched.length,
      limit,
      offset,
    };
  }
 
  async getCategories() {
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { places: true } },
      },
      orderBy: { name: 'asc' },
    });
 
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      placeCount: c._count.places,
    }));
  }
 
  /** Haversine formula — distance between two lat/lng points in km */
  private haversineKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
 
  private toRad(deg: number) {
    return (deg * Math.PI) / 180;
  }
}
