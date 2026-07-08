/**
 * Brand lockup pieces shared by the landing header, mobile drawer and footer.
 * The leaf mark always sits on a white gradient tile (per prototype) so it
 * reads identically in both themes; the wordmark is text — never redrawn.
 */

interface LeafTileProps {
  /** Tile edge in px (prototype: 46 header · 38 drawer · 40 footer). */
  size: number
  /** Tile corner radius in px (13 · 11 · 11). */
  radius: number
  /** Rendered leaf height in px (32 · 26 · 28). */
  leafHeight: number
  /** Header tile carries a drop shadow; the drawer/footer tiles do not. */
  shadow?: boolean
}

export function LeafTile({ size, radius, leafHeight, shadow = false }: LeafTileProps) {
  return (
    <span
      className="grid place-items-center border border-(--gold-border-soft)"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(160deg, var(--dutiva-white), #eef0f6)',
        boxShadow: shadow ? '0 4px 14px rgba(0,0,0,0.35)' : undefined,
      }}
    >
      <img
        src="/brand/dutiva-leaf.png"
        alt="Dutiva"
        style={{ display: 'block', height: leafHeight, width: 'auto' }}
      />
    </span>
  )
}

export function Wordmark({ fontSize = '1.15rem' }: { fontSize?: string }) {
  return (
    <span className="font-display font-bold text-text" style={{ fontSize }}>
      Duti<span className="text-gold-strong">va</span>
    </span>
  )
}
