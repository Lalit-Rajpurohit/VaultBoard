module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Path alias resolution for "@/..." imports.
      [
        'module-resolver',
        {
          root: ['./'],
          alias: { '@': './src' },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      // NOTE: On SDK 54 the Reanimated 4 / worklets Babel plugin is added
      // automatically by babel-preset-expo, so it must NOT be listed here.
    ],
  };
};
