export default null as any;

console.log("WORKER");

if (typeof window === "undefined" && typeof self !== "undefined") {
    console.log("Web Worker started");
} else {
    console.error("What");
}
self.onmessage = ({ data: { question } }) => {
    self.postMessage({
        answer: 42,
    });
};
