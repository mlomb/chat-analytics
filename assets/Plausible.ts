const PLAUSIBLE_URL = "env" in window && env.isProd ? "https://p.chatanalytics.app" : "http://localhost:8000";
const ALLOWED_PATHS = ["", "/demo", "/report"];

export const plausible = (name: "pageview" | string, props?: { [key: string]: string }) => {
    // We want the url where:
    // - the hostname is always "chatanalytics.app"
    // - the path is either "", "/", "/demo" or "/report"
    //   - if the hostname is not "chatanalytics.app" => then we are sure we are in a report => fallback to "/report"
    //   - if the path is neither => fallback to "/report"
    // - keeps any ?search=params

    let pathname: string;

    if (window.location.hostname !== "chatanalytics.app") {
        pathname = "/report";
    } else {
        pathname = window.location.pathname;
        pathname = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname; // make sure the path doesn't end with a slash
        pathname = ALLOWED_PATHS.includes(pathname) ? pathname : "/report";
    }

    const data = {
        domain: "chatanalytics.app",
        name,
        url: `https://chatanalytics.app${pathname}${window.location.search}`,
        referrer: document.referrer,
        screen_width: window.innerWidth,
        props,
    };

    fetch(PLAUSIBLE_URL + "/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
};

// These functions are used to round the input and avoid fingerprinting

// istanbul ignore next
export const sizeCategory = (size: number): string => {
    size /= 1024;
    if (size < 100) return "0-100KB";
    if (size < 500) return "100KB-500KB";
    if (size < 1000) return "500KB-1MB";
    if (size < 5000) return "1MB-5MB";
    if (size < 10000) return "5MB-10MB";
    if (size < 50000) return "10MB-50MB";
    if (size < 100000) return "50MB-100MB";
    if (size < 500000) return "100MB-500MB";
    if (size < 1000000) return "500MB-1GB";
    if (size < 5000000) return "1GB-5GB";
    return "5GB+";
};
// istanbul ignore next
export const numberCategory = (num: number): string => {
    num = Math.round(num);
    if (num <= 10) return num + "";
    if (num <= 50) return "10-50";
    if (num <= 100) return "50-100";
    if (num <= 500) return "100-500";
    if (num <= 1000) return "500-1k";
    if (num <= 5000) return "1k-5k";
    if (num <= 10000) return "5k-10k";
    if (num <= 50000) return "10k-50k";
    if (num <= 100000) return "50k-100k";
    if (num <= 500000) return "100k-500k";
    if (num <= 1000000) return "500k-1M";
    if (num <= 5000000) return "1M-5M";
    if (num <= 10000000) return "5M-10M";
    if (num <= 50000000) return "10M-50M";
    if (num <= 100000000) return "50M-100M";
    return "100M+";
};
// istanbul ignore next
export const timeCategory = (seconds: number): string => {
    seconds = Math.round(seconds);
    if (seconds <= 10) return seconds + "s";
    if (seconds <= 60) return "10s-1m";
    if (seconds <= 300) return "1m-5m";
    if (seconds <= 600) return "5m-10m";
    if (seconds <= 1800) return "10m-30m";
    if (seconds <= 3600) return "30m-1h";
    if (seconds <= 7200) return "1h-2h";
    return "2h+";
};
