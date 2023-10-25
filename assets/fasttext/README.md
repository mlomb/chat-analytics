This is a strip down version of [https://github.com/facebookresearch/fastText/tree/main/webassembly](https://github.com/facebookresearch/fastText/tree/main/webassembly)

Building instructions:

1. Install [Emscripten](https://emscripten.org/) (and activate the latest version)
2. Clone the [fastText repository](https://github.com/facebookresearch/fastText)
3. Copy our `fasttext_wasm.cc` to the fastText repo root you cloned
4. Run the following command in the fastText repo root:

    ```
    em++ --bind --std=c++11 -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -sMODULARIZE -s ENVIRONMENT=shell -s "EXPORTED_RUNTIME_METHODS=['FS']" -s "FORCE_FILESYSTEM=1" -Os --closure 1 -Isrc/ src/*.cc fasttext_wasm.cc -o fasttext_wasm.js
    ```

5. `fasttext_wasm.js` and `fasttext_wasm.wasm` should be ready!

