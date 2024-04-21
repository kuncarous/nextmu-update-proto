import { mkdirSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { rimrafSync } from 'rimraf';
import shell from 'shelljs';

const getAllFiles = (dirPath: string, arrayOfFiles?: string[]) => {
    const files = readdirSync(dirPath);
    const paths = arrayOfFiles ?? [];

    files.forEach((file) => {
        const filePath = path.join(dirPath, '/', file);
        if (statSync(filePath).isDirectory()) {
            getAllFiles(filePath, paths);
        } else {
            paths.push(filePath);
        }
    });

    return paths;
};

// https://github.com/shelljs/shelljs/issues/469
process.env.PATH += path.delimiter + path.resolve('./node_modules/.bin');

const PROTO_DIR = path.resolve('./proto/models');
const MODEL_DIR = path.resolve(process.env.PROTO_PATH!);
const PROTOC_GEN_TS_PATH = path.resolve(
    './node_modules/.bin/protoc-gen-ts.cmd',
);

rimrafSync(MODEL_DIR);
try {
    mkdirSync(MODEL_DIR, { recursive: true });
} catch (error) {}

const protoConfig = [
    `--plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}"`,
    `--grpc_out="grpc_js:${MODEL_DIR}"`,
    `--js_out="import_style=commonjs,binary:${MODEL_DIR}"`,
    `--ts_out="grpc_js:${MODEL_DIR}"`,
    `--proto_path ${PROTO_DIR} ${getAllFiles(PROTO_DIR).join(' ')}`,
];

// https://github.com/agreatfool/grpc_tools_node_protoc_ts/tree/master/examples
shell.exec(`grpc_tools_node_protoc ${protoConfig.join(' ')}`);

// https://github.com/dcodeIO/protobuf.js#command-line
// https://github.com/dcodeIO/protobuf.js#command-line-api
