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

it("emit correct types", async () => {
    const jp = setup(`
        {
            "string": "hello",
            "number": 1,
            "boolean": true,
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
