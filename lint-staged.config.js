module.exports = {
    // Type check TypeScript files
    '*.ts': () => 'tsc --noEmit',

    // Lint and format TypeScript and JavaScript files
    '*.{js,ts}': 'eslint --fix',
}
