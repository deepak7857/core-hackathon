import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateAnomaly } from '@/lib/detector';

export async function GET() {
  try {
    const records = await prisma.anomaly.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(records, { status: 200 });
  } catch (err) {
    console.error('Error fetching anomalies:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function POST(req) {
  try {
    const body = await req.json();
    const { device_id, lat, lng, speed_kmh, z_peak_g, depth_cm, water_present } = body;

    if (lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const currentLat = Number(lat);
    const currentLng = Number(lng);
    const zPeak = Number(z_peak_g || 0);
    const depth = Number(depth_cm || 0);
    const speed = Number(speed_kmh || 0);
    const isWater = Boolean(water_present);

    const latDelta = 0.0001;
    const lngDelta = 0.0001;

    const existingAnomaly = await prisma.anomaly.findFirst({
      where: {
        status: 'OPEN',
        lat: { gte: currentLat - latDelta, lte: currentLat + latDelta },
        lng: { gte: currentLng - lngDelta, lte: currentLng + lngDelta },
      },
    });

    if (existingAnomaly && zPeak < 1.2 && depth < 1.5) {
      const repaired = await prisma.anomaly.update({
        where: { id: existingAnomaly.id },
        data: {
          status: 'REPAIRED',
          resolvedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Existing anomaly verified as repaired',
        data: repaired,
      }, { status: 200 });
    }
    const assessment = evaluateAnomaly({
      zPeakG: zPeak,
      depthCm: depth,
      speedKmh: speed,
      waterPresent: isWater,
    });

    const saved = await prisma.anomaly.create({
      data: {
        deviceId: device_id || 'ESP32_NODE_01',
        lat: currentLat,
        lng: currentLng,
        speedKmh: speed,
        zPeakG: zPeak,
        depthCm: depth,
        waterPresent: isWater,
        severity: assessment.severity,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    console.error('Error saving anomaly:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const updated = await prisma.anomaly.update({
      where: { id },
      data: {
        status: status,
        resolvedAt: status === 'REPAIRED' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err) {
    console.error('Error updating anomaly status:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}