import path from 'path';
import shell from 'shelljs';
import { rimrafSync } from 'rimraf';
import { mkdirSync, readdirSync, statSync } from 'fs';

const getAllFiles = (dirPath: string, arrayOfFiles?: string[]) => {
	const files = readdirSync(dirPath);
	const paths = arrayOfFiles ?? [];

	files.forEach(
		(file) => {
			const filePath = path.join(dirPath, "/", file);
			if (statSync(filePath).isDirectory()) {
				getAllFiles(filePath, paths);
			} else {
				paths.push(filePath);
			}
		}
	);

	return paths;
}

// https://github.com/shelljs/shelljs/issues/469
process.env.PATH += (path.delimiter + path.join(__dirname, '../node_modules/.bin'));

const PROTO_DIR = path.join(__dirname, './models');
const MODEL_DIR = path.join(__dirname, '../src/proto');
const PROTOC_GEN_TS_PATH = path.join(__dirname, '../node_modules/.bin/protoc-gen-ts.cmd');

rimrafSync(MODEL_DIR);
try {
  mkdirSync(MODEL_DIR, { recursive: true });
} catch (error) {}

const protoConfig = [
  `--plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}"`,
  `--grpc_out="grpc_js:${MODEL_DIR}"`,
  `--js_out="import_style=commonjs,binary:${MODEL_DIR}"`,
  `--ts_out="grpc_js:${MODEL_DIR}"`,
  `--proto_path ${PROTO_DIR} ${getAllFiles(PROTO_DIR).join(' ')}`
];

// https://github.com/agreatfool/grpc_tools_node_protoc_ts/tree/master/examples
shell.exec(`grpc_tools_node_protoc ${protoConfig.join(' ')}`);

// https://github.com/dcodeIO/protobuf.js#command-line
// https://github.com/dcodeIO/protobuf.js#command-line-api