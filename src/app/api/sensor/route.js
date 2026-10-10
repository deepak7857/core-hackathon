import { NextResponse } from "next/server";
import axios from "axios";

const CHANNEL_ID = process.env.THINGSPEAK_CHANNEL_ID;
const WRITE_API_KEY = process.env.THINGSPEAK_WRITE_API_KEY;

export async function POST(req) {
  try {
    if (!CHANNEL_ID || !WRITE_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Missing ThingSpeak credentials in environment variables" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      device_id,
      lat,
      lng,
      speed_kmh,
      z_peak_g,
      depth_cm,
      hazard_type,
      water_level_cm
    } = body;

    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180
    ) {
      return NextResponse.json(
        { success: false, message: "Valid numeric latitude and longitude are required" },
        { status: 400 }
      );
    }

    const fields = {
      api_key: WRITE_API_KEY,
      field1: lat,
      field2: lng,
      field3: speed_kmh,
      field4: z_peak_g,
      field5: depth_cm,
      field6: hazard_type === "water" ? 1 : hazard_type === "excavation" ? 2 : 0,
      field7: water_level_cm,
      status: `Device: ${device_id || "ESP32"}`
    };

    const response = await axios.post(
      "https://api.thingspeak.com/update.json",
      new URLSearchParams(
        Object.entries(fields)
          .filter(([_, value]) => value !== undefined && value !== null && value !== "")
          .map(([key, value]) => [key, String(value)])
      ).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000
      }
    );

    const entryId = response.data;

    if (entryId === 0) {
      return NextResponse.json(
        { success: false, message: "ThingSpeak rejected the update (rate limited - minimum 15s interval for free tier)." },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sensor data uploaded to ThingSpeak",
      channel_id: CHANNEL_ID,
      entry_id: entryId
    });

  } catch (error) {
    console.error("ThingSpeak error:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, message: "Failed to upload sensor data" },
      { status: 500 }
    );
  }
}