/**
 * shippingTariffs.ts — carrier tariffs per Wilaya (01–58), departing from Batna.
 *
 * Single source of truth for delivery fees (DZD, standard parcels ≤ 5 kg). Edit the ZONES table to
 * change a rate: every wilaya of a zone follows. `null` = Stop Desk not available for that carrier.
 * The whole map ships with the page, so selecting a wilaya / carrier needs no extra request.
 */

export type Carrier = 'zr_express' | 'dhd'

export const CARRIERS: readonly Carrier[] = ['zr_express', 'dhd']
export const DEFAULT_CARRIER: Carrier = 'zr_express'

/** Display names (brand names, identical in FR / AR). */
export const CARRIER_NAMES: Record<Carrier, string> = { zr_express: 'ZR Express', dhd: 'DHD Express' }

export interface Tariff {
  /** Home delivery (Domicile), DA. */
  home: number
  /** Stop Desk pick-up, DA — null when unavailable. */
  desk: number | null
}

export type WilayaTariffs = Record<Carrier, Tariff>

const t = (home: number, desk: number | null): Tariff => ({ home, desk })

interface Zone {
  codes: string[]
  zr_express: Tariff
  dhd: Tariff
}

const ZONES: Zone[] = [
  { codes: ['05'], zr_express: t(450, 350), dhd: t(550, 400) }, // Batna — local
  {
    codes: ['04', '07', '12', '19', '21', '23', '24', '25', '28', '34', '36', '40', '41', '43', '51'],
    zr_express: t(750, 500),
    dhd: t(600, 400),
  }, // East & neighbouring
  {
    codes: ['02', '06', '09', '10', '15', '16', '18', '26', '35', '38', '42', '44'],
    zr_express: t(850, 520),
    dhd: t(750, 400),
  }, // Center & coastal
  {
    codes: ['13', '14', '20', '22', '27', '29', '31', '32', '45', '46', '48'],
    zr_express: t(900, 550),
    dhd: t(900, 450),
  }, // West
  {
    codes: ['03', '17', '30', '39', '47', '55', '58'],
    zr_express: t(950, 650),
    dhd: t(850, 450),
  }, // Near south
  { codes: ['57'], zr_express: t(950, null), dhd: t(850, null) }, // El M'Ghair — no Stop Desk
  {
    codes: ['01', '08', '11'],
    zr_express: t(1400, 950),
    dhd: t(1200, 600),
  }, // Deep south (Stop Desk available)
  {
    codes: ['33', '37', '49', '50', '52', '53', '54', '56'],
    zr_express: t(1400, null),
    dhd: t(1200, null),
  }, // Deep south (no Stop Desk)
]

/** Wilaya code ("01"…"58") → tariffs for each carrier. */
export const WILAYA_TARIFFS: Record<string, WilayaTariffs> = Object.fromEntries(
  ZONES.flatMap((z) => z.codes.map((code) => [code, { zr_express: z.zr_express, dhd: z.dhd }])),
)

export function getRate(
  tariffs: WilayaTariffs | undefined,
  carrier: Carrier,
  delivery: 'home' | 'desk',
): number | null {
  if (!tariffs) return null
  return tariffs[carrier][delivery]
}
