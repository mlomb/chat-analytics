import * as app_worker from "app_worker";

(async () => {
    // create test file with fixed string

    const response = await fetch("/sample.json");
    const txt = await response.text();

    const inmemoryfile = new File([txt], "test.json");

    await app_worker;

    app_worker.init_panic_hook();

    console.time("process_files");
    console.log(app_worker);
    console.log(app_worker.process_files([inmemoryfile]));
    console.timeEnd("process_files");

    //const wasmModule = await import("./worker/target/wasm32-unknown-unknown/release/app_worker.wasm");
    //console.log(wasmModule);
    //console.log(wasmModule.add(1, 3));
})();
