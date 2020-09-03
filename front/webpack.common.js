const path = require('path')

const srcFilePath = path.join(__dirname, 'src')
const coreFilePath = path.join(srcFilePath, 'core')
/* const publicFilePath = path.join(srcFilePath, 'public') */

module.exports = {
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: 'ts-loader',
            },
            {
                exclude: /node_modules/,
                test: /\.css$/,
                use: ['style-loader', 'postcss-loader'],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack', 'url-loader'],
            },
            ],
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            alias: {
            '@/src': path.resolve(srcFilePath),
            '@/core': path.resolve(coreFilePath), 
            '@/layouts': path.resolve(coreFilePath, 'layouts'),
            '@/styles': path.resolve(coreFilePath, 'layouts', 'styles'),
        },
    },
}