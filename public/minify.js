const minifyCSS = css => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([:;{}])\s*/g, '$1').replace(/;}/g, '}').trim();
const minifyJS = js => js.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/\s+/g, ' ').replace(/\s*([:;{}(),=])\s*/g, '$1').trim();
const minifyHTML = html => html.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').replace(/\s+>/g, '>').replace(/<\s+/g, '<').trim();
const minifyPHP = php => php.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/\s+/g, ' ').replace(/\s*([:;{}(),=])\s*/g, '$1').trim();

const mimeTypes = {
    json: 'application/json',
    css: 'text/css',
    js: 'application/javascript',
    html: 'text/html',
    php: 'application/x-httpd-php'
};

const formatBytes = bytes => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, sizeIndex)).toFixed(2)} ${units[sizeIndex]}`;
};

document.getElementById('fileInput').addEventListener('change', function () {
    document.querySelector('button[type="submit"]').disabled = !this.files[0] || !['json', 'css', 'js', 'html', 'php'].includes(this.files[0].name.split('.').pop().toLowerCase());
});

document.getElementById('upload-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const file = document.getElementById('fileInput').files[0];
    const submitButton = document.getElementById('submitButton');
    const outputElement = document.getElementById('output');
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileType = mimeTypes[fileExtension];

    if (!file || !fileType) {
        alert(file ? 'Ekstensi file tidak didukung.' : 'Silakan pilih file terlebih dahulu.');
        return;
    }

    submitButton.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const content = e.target.result;
            const minifiedContent = {
                json: () => JSON.stringify(JSON.parse(content)),
                css: minifyCSS,
                js: minifyJS,
                html: minifyHTML,
                php: minifyPHP
            }[fileExtension](content);
    
            const originalSize = new Blob([content]).size;
            const compressedSize = new Blob([minifiedContent]).size;
            const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
    
            outputElement.textContent = `Original Size: ${formatBytes(originalSize)}\nCompressed Size: ${formatBytes(compressedSize)}\nSavings: ${savings}%\n\n`;
            outputElement.classList.remove('hidden'); 
    
            const url = URL.createObjectURL(new Blob([minifiedContent], { type: fileType }));
            const downloadFileName = `${file.name.replace(`.${fileExtension}`, '')}-compressed.${fileExtension}`;
    
            document.getElementById('downloadButton').onclick = () => {
                const link = document.createElement('a');
                link.href = url;
                link.download = downloadFileName;
                link.click();
            };
    
            document.getElementById('downloadButton').classList.remove('hidden');
            document.getElementById('downloadButton').classList.add('inline-block');
    
        } catch (error) {
            alert(`Terjadi kesalahan saat memproses file: ${error.message}`);
            outputElement.classList.add('hidden'); 
            document.getElementById('downloadButton').classList.add('hidden'); 
        } finally {
            submitButton.innerHTML = '<i class="bi bi-check2-circle"></i>';
        }
    };
    reader.readAsText(file);
});