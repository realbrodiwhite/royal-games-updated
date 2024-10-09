import { override, addWebpackModuleRule } from 'customize-cra';

export default override(
  addWebpackModuleRule({
    test: /\.scss$/,
    use: [
      'style-loader',
      'css-loader',
      'sass-loader'
    ]
  })
);
