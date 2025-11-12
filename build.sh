mkdir -p docs
cp -r src/* docs
drop-inline-css -r src -o docs
deno bundle src/index.js -o docs/index.js
minify -r docs -o .
