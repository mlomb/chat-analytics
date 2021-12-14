import JSONStream from "@pipeline/parse/JSONStream";

function setup(input: string): JSONStream {
    const te = new TextEncoder();
    const buffer = te.encode(input);
    return new JSONStream({
        name: "input",
        size: buffer.length,
        slice: (start, end) => new Promise<ArrayBuffer>((resolve) => resolve(buffer.slice(start, end))),
    });
}

it("emit correct full objects", async () => {
    const jp = setup(`
        {
            "string": "hello",
            "number": 1,
            "boolean": true,
            "ignored": {
                "string": "hello",
                "number": 1,
                "boolean": true,
                "null": null,
                "array": [1, 2, 3],
                "object": { "a": 1 }
            },
            "null": null,
            "array": [1, 2, 3],
            "object": { "a": 1 }
        }
    `);

    const missingKeys = new Set(["string", "number", "boolean", "null", "array", "object"]);

    function register<T>(key: string, expected: T) {
        jp.onFull<T>(key, (got) => {
            missingKeys.delete(key);
            expect(got).toEqual(expected);
        });
    }

    register("string", "hello");
    register("number", 1);
    register("boolean", true);
    register("null", null);
    register("array", [1, 2, 3]);
    register("object", { a: 1 });

    for await (const _ of jp.parse());

    expect(missingKeys).toEqual(new Set());
});

it("emit correct array objects", async () => {
    const jp = setup(`
        {
            "a": "b",
            "arrVals": [1, 2, 3],
            "c": "d",
            "arrObjs": [{ "a": 1 }, { "b": 2 }, { "c": 3 }],
            "e": "f"
        }
    `);

    let nums: number[] = [],
        objs: { a: number }[] = [];

    jp.onArray<number>("arrVals", (got) => nums.push(got));
    jp.onArray<{ a: number }>("arrObjs", (got) => objs.push(got));

    for await (const _ of jp.parse());

    expect(nums).toEqual([1, 2, 3]);
    expect(objs).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
});

async function expectCrash(input: string) {
    const jp = setup(input);
    try {
        for await (const _ of jp.parse());
        // should have crashed
        expect(true).toBe(false);
    } catch (_) {
        // expected
    }
}

it("crash on invalid input", async () => expectCrash(`{ "a": "b", { "a": 1 }, }`));
it("crash when the input is an array", async () => expectCrash(`[1, 2, 3]`));
it("crash when the input is a number", async () => expectCrash(`5`));
it("crash when the input is null", async () => expectCrash(`null`));
it("crash when the input is a boolean", async () => expectCrash(`true`));
it("crash when the input is a string", async () => expectCrash(`"foo"`));

it("crash when using onArray on something other than an array", async () => {
    const jp = setup(`{ "fakeArr": { "a": 5 } }`);
    jp.onArray<any>("fakeArr", () => {});

    try {
        for await (const _ of jp.parse());
        // should have crashed
        expect(true).toBe(false);
    } catch (_) {
        // expected
    }
});
