/** Private logo scope only; this never grants partnership or public publication. */
export function privatePartnerAssetAllowed(asset: {
  slot: string;
  width: number;
  height: number;
  source: { root: string; relative: string };
  derivative: { root: string; relative: string };
}) {
  return (
    /^partner-[0-5]$/.test(asset.slot) &&
    asset.source.root === "client" &&
    /^partners\/[^/\\\0]+\.png$/i.test(asset.source.relative) &&
    asset.derivative.root === "preview" &&
    /^[a-f0-9]{64}-480\.webp$/.test(asset.derivative.relative) &&
    Number.isInteger(asset.width) &&
    asset.width > 0 &&
    asset.width <= 480 &&
    Number.isInteger(asset.height) &&
    asset.height > 0 &&
    asset.height <= 480
  );
}
