export type WeatherSignal = {
  highTempF?: number;
  lowTempF?: number;
  precipitationChance?: number;
  severeWeather?: boolean;
  summary?: string;
};

async function externalFetch<T>(url: string | undefined, apiKey: string | undefined, path: string) {
  if (!url || !apiKey) {
    return null;
  }

  const response = await fetch(`${url.replace(/\/$/, "")}${path}`, {
    headers: { authorization: `Bearer ${apiKey}` },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`External data request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getWeatherForZip(zip: string): Promise<WeatherSignal | null> {
  return externalFetch<WeatherSignal>(
    process.env.WEATHER_API_URL,
    process.env.WEATHER_API_KEY,
    `/forecast?zip=${encodeURIComponent(zip)}`,
  );
}

export async function getPropertyRecord(addressOrZip: string) {
  return externalFetch<Record<string, unknown>>(
    process.env.PROPERTY_RECORDS_API_URL,
    process.env.PROPERTY_RECORDS_API_KEY,
    `/property?query=${encodeURIComponent(addressOrZip)}`,
  );
}

export async function getManufacturerSchedule(makeOrModel: string) {
  return externalFetch<Record<string, unknown>>(
    process.env.MANUFACTURER_SCHEDULES_API_URL,
    process.env.MANUFACTURER_SCHEDULES_API_KEY,
    `/schedules?query=${encodeURIComponent(makeOrModel)}`,
  );
}
