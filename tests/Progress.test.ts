import { Progress } from "@pipeline/Progress";

let fn: jest.Mock;
let progress: Progress;

beforeEach(() => {
    fn = jest.fn();
    progress = new Progress();
    progress.on("progress", fn);
});

it("should emit after new()", () => {
    progress.new("title", "subject");

    expect(fn).toBeCalledWith([{ status: "processing", subject: "subject", title: "title" }], {});
});

it("should emit progress after progress()", () => {
    progress.on("progress", fn);

    progress.new("title", "subject");
    progress.progress("number", 3, 10);

    const taskWithProgress = (actual: number) => ({
        status: "processing",
        subject: "subject",
        title: "title",
        progress: {
            actual,
            format: "number",
            total: 10,
        },
    });

    expect(fn).toBeCalledWith([taskWithProgress(3)], {});
    progress.progress("number", 7, 10);
    expect(fn).toBeCalledWith([taskWithProgress(7)], {});
    progress.progress("number", 10, 10);
    expect(fn).toBeCalledWith([taskWithProgress(10)], {});
});

it("should emit after success()", () => {
    progress.new("title", "subject");
    progress.success();

    expect(fn).toBeCalledWith([{ status: "success", subject: "subject", title: "title" }], {});
});

it("should emit after error()", () => {
    progress.new("title", "subject");
    progress.error("poop");

    expect(fn).toBeCalledWith([{ status: "error", subject: "subject", title: "title", error: "poop" }], {});
});

it("stats should be updated", () => {
    progress.stat("a", 5);
    expect(fn).toBeCalledWith([], { a: 5 });
    progress.stat("b", 10);
    expect(fn).toBeCalledWith([], { a: 5, b: 10 });
    progress.stat("a", 15);
    expect(fn).toBeCalledWith([], { a: 15, b: 10 });
    progress.stat("a", 20);
    expect(fn).toBeCalledWith([], { a: 20, b: 10 });
});

it("should top up progress after success", () => {
    progress.new("title", "subject");
    progress.progress("number", 3, 10);
    progress.success();

    expect(fn).toBeCalledWith(
        [
            {
                status: "success",
                subject: "subject",
                title: "title",
                progress: { actual: 10, format: "number", total: 10 }, // actual here is 10 instead of 3
            },
        ],
        {}
    );
});

it("should crash calling new after an error", () => {
    progress.error("poop");
    expect(() => progress.new("", "")).toThrow("Can't create new progress task after an error");
});

it("should crash calling progress without an active task", () => {
    expect(() => progress.progress("number", 3, 10)).toThrow("No active task to update progress");
});

it("should crash calling success without an active task", () => {
    expect(() => progress.success()).toThrow("No active task to mark as success");
});
