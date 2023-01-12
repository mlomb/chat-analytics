export const plausible = (name: string, options: { url?: string; props?: { [key: string]: string } } = {}) => {
    const plausibleURL = env.isProd ? "https://p.chatanalytics.app" : "http://localhost:8000";

    // Avoid leaking personal information
    // it happened in the past, we don't know why
    // so we'll try to a void it replace any URL
    // we don't recognize
    let url = options.url || window.location.href;
    if (!url.startsWith("https://chatanalytics.app")) {
        url = "https://chatanalytics.app/report";
    }

    const data: any = {
        domain: "chatanalytics.app",
        name,
        url,
        referrer: document.referrer || null,
        screen_width: window.innerWidth,
    };
    if (options.props) {
        data.props = JSON.stringify(options.props);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${plausibleURL}/api/event`, true);
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.send(JSON.stringify(data));
};

// These functions are used to round the input and avoid fingerprinting

export const sizeCategory = (size: number): string => {
    if (false) {} // prettier-ignore
    else if (size < 1024 * 100) return "0-100KB";
    else if (size < 1024 * 500) return "100KB-500KB";
    else if (size < 1024 * 1000) return "500KB-1MB";
    else if (size < 1024 * 5000) return "1MB-5MB";
    else if (size < 1024 * 10000) return "5MB-10MB";
    else if (size < 1024 * 50000) return "10MB-50MB";
    else if (size < 1024 * 100000) return "50MB-100MB";
    else if (size < 1024 * 500000) return "100MB-500MB";
    else if (size < 1024 * 1000000) return "500MB-1GB";
    else if (size < 1024 * 5000000) return "1GB-5GB";
    return "5GB+";
};
export const numberCategory = (num: number): string => {
    num = Math.round(num);
    if (false) {} // prettier-ignore
    else if (num <= 10) return num + "";
    else if (num <= 50) return "10-50";
    else if (num <= 100) return "50-100";
    else if (num <= 500) return "100-500";
    else if (num <= 1000) return "500-1k";
    else if (num <= 5000) return "1k-5k";
    else if (num <= 10000) return "5k-10k";
    else if (num <= 50000) return "10k-50k";
    else if (num <= 100000) return "50k-100k";
    else if (num <= 500000) return "100k-500k";
    else if (num <= 1000000) return "500k-1M";
    else if (num <= 5000000) return "1M-5M";
    else if (num <= 10000000) return "5M-10M";
    else if (num <= 50000000) return "10M-50M";
    else if (num <= 100000000) return "50M-100M";
    return "100M+";
};
export const timeCategory = (seconds: number): string => {
    seconds = Math.round(seconds);
    if (false) {} // prettier-ignore
    else if (seconds <= 10) return seconds + "s";
    else if (seconds <= 60) return "10s-1m";
    else if (seconds <= 300) return "1m-5m";
    else if (seconds <= 600) return "5m-10m";
    else if (seconds <= 1800) return "10m-30m";
    else if (seconds <= 3600) return "30m-1h";
    else if (seconds <= 7200) return "1h-2h";
    return "2h+";
};
