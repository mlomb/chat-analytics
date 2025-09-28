import * as app_worker from "app_worker";

(async () => {
    // create test file with fixed string
    const inmemoryfile = new File(["{a}"], "test.txt");

    await app_worker;

    app_worker.init_panic_hook();

    console.log(app_worker);
    console.log(app_worker.process_files([inmemoryfile, inmemoryfile, inmemoryfile]));
    //const wasmModule = await import("./worker/target/wasm32-unknown-unknown/release/app_worker.wasm");
    //console.log(wasmModule);
    //console.log(wasmModule.add(1, 3));
})();
