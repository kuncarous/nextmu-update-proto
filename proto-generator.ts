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

rimrafSync(MODEL_DIR);
try {
    mkdirSync(MODEL_DIR, { recursive: true });
} catch (error) {}

// https://github.com/agreatfool/grpc_tools_node_protoc_ts/tree/master/examples
shell.exec(
    `proto-loader-gen-types --longs=String --defaults=true --arrays=true --oneofs --grpcLib=@grpc/grpc-js --outDir=${path.join(MODEL_DIR, path.sep)} ${getAllFiles(PROTO_DIR).join(' ')}`,
);

// https://github.com/dcodeIO/protobuf.js#command-line
// https://github.com/dcodeIO/protobuf.js#command-line-api
