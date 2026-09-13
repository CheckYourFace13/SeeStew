/** Google AdSense ads.txt line — must match publisher ID in AdSense account. */
export const ADSENSE_PUBLISHER_PUB_ID = "pub-9572509189594279";

export const ADSENSE_CLIENT_ID = `ca-${ADSENSE_PUBLISHER_PUB_ID}`;

export const ADSENSE_CERTIFICATION_ID = "f08c47fec0942fa0";

/** Canonical ads.txt body (IETF ads.txt format). Single line + trailing newline. */
export const adsTxtContent = `google.com, ${ADSENSE_PUBLISHER_PUB_ID}, DIRECT, ${ADSENSE_CERTIFICATION_ID}\n`;
