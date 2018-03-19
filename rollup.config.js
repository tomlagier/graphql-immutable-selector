import resolve from 'rollup-plugin-node-resolve';
import cjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/bundle.js',
        format: 'umd',
        name: 'graphql-immutable-selector'
      }
    ],
    plugins: [
      resolve(),
      cjs({
        namedExports: {
          'node_modules/graphql/language/index.js': [
            'print',
            'parse'
          ]
        }
      }),
      babel()
    ]
  }
];
