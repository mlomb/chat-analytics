/** Zero is reserved for an unavailable score; the byte layout stays unchanged. */
export const encodeSentiment = (sentiment: number | undefined): number => {
    if (sentiment === undefined || !Number.isFinite(sentiment)) return 0;

    // Preserve polarity for fractional emoji scores instead of truncating toward negative infinity.
    const integer = Math.sign(sentiment) * Math.ceil(Math.abs(sentiment));
    return Math.max(-127, Math.min(127, integer)) + 128;
};

export const decodeSentiment = (encoded: number): number | undefined => (encoded === 0 ? undefined : encoded - 128);
