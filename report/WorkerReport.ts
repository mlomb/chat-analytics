export default null as any;

self.onmessage = ({ data: { question } }) => {
    self.postMessage({
        answer: 42,
    });
};

console.log("WorkerReport started");
