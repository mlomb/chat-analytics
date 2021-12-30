import { JSONStream } from "@pipeline/parse/JSONStream";

describe("full object", () => {
    let stream: JSONStream;
    let missingKeys: Set<string>;

    const FULL_OBJECT = `
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
    `;

    beforeEach(() => {
        stream = new JSONStream();
        missingKeys = new Set(["string", "number", "boolean", "null", "array", "object"]);

        function register<T>(key: string, expected: T) {
            stream.onObject<T>(key, (got) => {
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
    });

    it("emit correct single push", async () => {
        stream.push(FULL_OBJECT);
        expect(missingKeys).toEqual(new Set());
    });

    it("emit correct streaming char by char", async () => {
        for (const c of FULL_OBJECT) stream.push(c);
        expect(missingKeys).toEqual(new Set());
    });
});

it("emit correct array objects", async () => {
    const stream = new JSONStream();

    let nums: number[] = [],
        objs: { a: number }[] = [];

    stream.onArrayItem<number>("arrVals", (got) => void nums.push(got));
    stream.onArrayItem<{ a: number }>("arrObjs", (got) => void objs.push(got));

    stream.push(
        `
        {
            "a": "b",
            "arrVals": [1, 2, 3],
            "c": "d",
            "arrObjs": [{ "a": 1 }, { "b": 2 }, { "c": 3 }],
            "e": "f"
        }
    `
    );

    expect(nums).toEqual([1, 2, 3]);
    expect(objs).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
});

describe("escaping", () => {
    test.each([`\\\\`, `\\n`, `\\"`, `\\u00f8`])("escape with %p", async (esc) => {
        new JSONStream().push(`{ "a${esc}b": "c" }`);
        new JSONStream().push(`{ "a": "b${esc}c" }`);
        new JSONStream().push(`{ "a": { "c": "d${esc}e" } }`);
    });
});

it("string with brackets", async () => {
    new JSONStream().push(`{ "a": "c{}{[][}{[!}{}[<}{]\\n][]]]}[>[][" }`);
});

it("string with unicode characters", async () => {
    new JSONStream().push(`{ "a": "◄💩💩💩💩►", "b": "◄💩💩💩💩►", "c": "normal☰☰☰" }`);
});

async function expectCrash(input: string) {
    const stream = new JSONStream();
    try {
        stream.push(input);
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
    const stream = new JSONStream();
    stream.onArrayItem<any>("fakeArr", () => {});

    try {
        stream.push(`{ "fakeArr": { "a": 5 } }`);
        // should have crashed
        expect(true).toBe(false);
    } catch (_) {
        // expected
    }
});
