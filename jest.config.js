const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    clearMocks: true,
    testEnvironment: 'node',
    setupFilesAfterEnv: [
        "./node_modules/@hirez_io/jest-single/dist/jest-single.js",
        "./node_modules/@relmify/jest-fp-ts",
        "./src/singleton.ts"
    ],

    modulePaths: [compilerOptions.baseUrl],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths)
}