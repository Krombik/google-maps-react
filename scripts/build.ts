import { build } from 'tsup';
import ts from 'typescript';
import fs from 'fs/promises';

const NESTED_PACKAGE_JSON = JSON.stringify({
  sideEffects: false,
  module: './index.js',
  main: './index.cjs',
  types: './index.d.ts',
});

const COMPONENTS_FOLDER = 'components';

const HOOKS_FOLDER = 'hooks';

const SERVICE_FOLDER = 'service';

const addNestedPackagesJson = async (path: string, nested: string[] = []) => {
  const dirs = await fs.readdir(path);

  for (let i = 0; i < dirs.length; i++) {
    const folder = dirs[i];

    if (nested.includes(folder)) {
      await addNestedPackagesJson(`${path}/${folder}`);
    } else {
      await fs.writeFile(`${path}/${folder}/package.json`, NESTED_PACKAGE_JSON);
    }
  }
};

const pickFrom = (obj: Record<string, any>, keys: string[]) =>
  keys.reduce<Record<string, any>>(
    (acc, key) => ({ ...acc, [key]: obj[key] }),
    {}
  );

const getMainPackageJson = async () =>
  JSON.stringify({
    ...pickFrom(JSON.parse((await fs.readFile('package.json')).toString()), [
      'name',
      'version',
      'author',
      'description',
      'keywords',
      'repository',
      'license',
      'bugs',
      'homepage',
      'peerDependencies',
      'peerDependenciesMeta',
      'dependencies',
      'engines',
    ]),
    publishConfig: {
      access: 'public',
    },
    main: './index.cjs',
    module: './index.js',
    types: './index.d.ts',
    sideEffects: false,
  });

const cleanupEmpty = async (path: string) => {
  const nested = await fs.readdir(path);

  for (let i = 0; i < nested.length; i++) {
    const nestedPath = `${path}/${nested[i]}`;

    if (nestedPath.endsWith('.d.ts')) {
      if ((await fs.readFile(nestedPath)).toString() === 'export {};\n') {
        await fs.rm(nestedPath);
      }
    } else if ((await fs.lstat(nestedPath)).isDirectory()) {
      await cleanupEmpty(nestedPath);
    }
  }

  if (!(await fs.readdir(path)).length) {
    await fs.rmdir(path);
  }
};

const run = async (outDir: string) => {
  await fs.rm(outDir, { recursive: true, force: true });

  await build({
    outDir: outDir,
    minify: true,
    entry: [
      'src/index.ts',
      `src/${COMPONENTS_FOLDER}/*/*.(ts|tsx)`,
      `src/${HOOKS_FOLDER}/!(${SERVICE_FOLDER})/*.ts`,
      `src/${HOOKS_FOLDER}/${SERVICE_FOLDER}/*/*.ts`,
    ],
    splitting: true,
    sourcemap: true,
    clean: false,
    target: 'es2020',
    treeshake: { preset: 'smallest' },
    dts: false,
    format: ['cjs', 'esm'],
    platform: 'browser',
    external: ['react'],
  });

  await addNestedPackagesJson(`${outDir}/${COMPONENTS_FOLDER}`);
  await addNestedPackagesJson(`${outDir}/${HOOKS_FOLDER}`, [SERVICE_FOLDER]);

  await fs.writeFile(`${outDir}/package.json`, await getMainPackageJson());

  const fileList = ['LICENSE', 'README.md'];

  for (let i = 0; i < fileList.length; i++) {
    const fileName = fileList[i];

    await fs.copyFile(fileName, `${outDir}/${fileName}`);
  }

  if (
    ts
      .createProgram(['src/index.ts'], {
        emitDeclarationOnly: true,
        declaration: true,
        stripInternal: true,
        outDir,
        jsx: ts.JsxEmit.React,
      })
      .emit().emitSkipped
  ) {
    throw new Error('TypeScript compilation failed');
  }

  await cleanupEmpty(outDir);
};

run('build');
