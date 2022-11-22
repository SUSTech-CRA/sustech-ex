const levelsStyleText = `
#countrys>*[level="5"]{fill:#FF7E7E;}
#countrys>*[level="4"]{fill:#FFB57E;}
#countrys>*[level="3"]{fill:#FFE57E;}
#countrys>*[level="2"]{fill:#A8FFBE;}
#countrys>*[level="1"]{fill:#88AEFF;}
#countrys>*[level="w"]{fill:#edd1ff;}
`;

const replaceSVG = text => {
    text = text.replace(/ transform="matrix\(1 0 0 1 (\d+)(?:\.\d+)? (\d+)(?:\.\d+)?\)" class="(.+)"/g, ' x="$1" y="$2" class="$3"')
    text = text.replace(/<!--.+?-->/g, '')
    text = text.replace(/\n+/g, '\n')
    text = text.replace(/ xml:space="preserve"/g, '')
    text = text.replace(/ style="enable-background:new 0 0 \d+ \d+;?"/g, '')
    text = text.replace(/width="\d+px" height="\d+px"/g, '')
    text = text.replace(/ x="0px" y="0px"/g, '')
    text = text.replace(/ id="图层_1"/g, '')
    text = text.replace(/ version="1.1"/g, '')
    text = text.replace(/ xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/g, '')
    text = text.replace(/<rect y="0" class=".+?" width="2000" height="1210"\/?>/g, '')
    text = text.replace(/'Tensentype-JiaLiDaYuanJF'/g, 'slice')

    text = text.replace(/<polygon id="(.+?)" class="(.+?)" points="([^"]+)\s{0,}"\/>/g, (all, id, c, p) => {
        return `<path id="${id}" class="${c}" d="M${p.trim().replace(/[\n\r]/g, ' ').replace(/\s+/g, ' ')}z" />`
    });
    // <rect id="法国" x="1" y="10" class="st1" width="100" height="1000"/>
    // <path id="法国" class="st1" d="M1 10h100v1000H1Z" />
    text = text.replace(/<rect id="(.+?)" x="(\d+)" y="(\d+)" class="(.+?)" width="(\d+)" height="(\d+)"\/>/g, (all, id, x, y, c, w, h) => {
        // console.log(x,y,w,h)
        return `<path id="${id}" class="${c}" d="M${x} ${y}h${w}v${h}H${x}Z" />`
    });

    text = text.replace(/<style type="text\/css">/, '<style></style><style>' + levelsStyleText)
    return text;
};
const ver = Math.floor(+new Date() / 10000).toString(36);
const replaceVersion = text => text.replace(/\{version\}/g, ver);


const {readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync} = require('fs');


let xml = readFileSync('nkd-ex2.svg', 'utf8');

xml = replaceSVG(xml);
writeFileSync('world-fixed.svg', xml);


if (!existsSync('dist')) mkdirSync('dist');

let html = readFileSync('html/index.html', 'utf8');

html = html.replace(/<!--svg-->/, xml.replace(/^<\?xml version="1.0" encoding="utf-8"\?>\n/, ''));
html = html.replace(/\n\s+viewBox=/, ' viewBox=');
html = html.replace(/\n\s{0,}\n/g, '\n');
html = html.replace(/\s+"/g, '"');
html = html.replace(/\s+\/>/g, '/>');
html = html.replace(/(\d+)\s+([\dvV]+)/g, '$1 $2');

html = html.replace(/<style[\s\S]+<\/style>/ig, all => all.replace(/\n\s{0,}/g, ''));
html = replaceVersion(html);
const {minify} = require('html-minifier');

const options = {
    includeAutoGeneratedTags: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true
};

html = minify(html, options);


writeFileSync('dist/index.html', html, 'utf8');


const UglifyJS = require('uglify-js');


let jsText = readFileSync('html/document.js', 'utf8');

jsText = replaceVersion(jsText);
jsText = jsText.replace(/<!--.+?-->/g, '');
jsText = jsText.replace(/^\s{0,}\/\/.+/g, '');
/*jsText = `(_=>{${jsText}})()`;
const minified = UglifyJS.minify({
    'document.js': jsText
}, {
    // drop_console: true,
    // pass: 3
})
if (!minified.code) {
    throw minified;
}
jsText = minified.code;*/
writeFileSync('dist/document.js', jsText, 'utf8');


copyFileSync('html/document.css', 'dist/document.css');
copyFileSync('html/slice.woff', 'dist/slice.woff');