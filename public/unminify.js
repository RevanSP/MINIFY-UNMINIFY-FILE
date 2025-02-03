const unminifyCSS = css => css.replace(/([{};])/g, '$1\n').replace(/\s+/g, ' ').replace(/(\S)([{};])/g, '$1 $2').trim();
const unminifyJS = js => js.replace(/([{}();,=])/g, '$1\n').replace(/\s+/g, ' ').replace(/(\S)([{}();,=])/g, '$1 $2').trim();
const unminifyHTML = html => html.replace(/>/g, '>\n').replace(/</g, '\n<').replace(/\s+/g, ' ').trim();
const unminifyPHP = php => php.replace(/([{}();,=])/g, '$1\n').replace(/\s+/g, ' ').replace(/(\S)([{}();,=])/g, '$1 $2').trim();

const fileTypes = {
    json: 'application/json',
    css: 'text/css',
    js: 'application/javascript',
    html: 'text/html',
    php: 'application/x-httpd-php'
};

document.getElementById('fileInput-unminify').addEventListener('change', function () {
    document.querySelector('#submitButton-unminify').disabled = !this.files[0] || !['json', 'css', 'js', 'html', 'php'].includes(this.files[0].name.split('.').pop().toLowerCase());
});

document.getElementById('upload-unminify-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const file = document.getElementById('fileInput-unminify').files[0];
    const submitButton = document.getElementById('submitButton-unminify');
    const outputElement = document.getElementById('output-unminify');
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileType = fileTypes[fileExtension];

    if (!file || !fileType) {
        alert(file ? 'Unsupported file extension.' : 'Please select a file first.');
        return;
    }

    submitButton.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
    
    const reader = new FileReader();
    reader.onload = function () {
        try {
            const content = reader.result;
            const unminifiedContent = {
                json: () => JSON.stringify(JSON.parse(content), null, 2),
                css: unminifyCSS,
                js: unminifyJS,
                html: unminifyHTML,
                php: unminifyPHP
            }[fileExtension](content);

            const originalSize = new Blob([content]).size;
            const unminifiedSize = new Blob([unminifiedContent]).size;
            const savings = ((originalSize - unminifiedSize) / originalSize * 100).toFixed(2);

            outputElement.textContent = `Original Size: ${formatBytes(originalSize)}\nUnminified Size: ${formatBytes(unminifiedSize)}\nSavings: ${savings}%\n\n`;
            outputElement.classList.remove('hidden');

            const url = URL.createObjectURL(new Blob([unminifiedContent], { type: fileType }));
            const downloadFileName = `${file.name.replace(`.${fileExtension}`, '')}-unminified.${fileExtension}`;

            document.getElementById('downloadButton-unminify').onclick = () => {
                const link = document.createElement('a');
                link.href = url;
                link.download = downloadFileName;
                link.click();
            };
            document.getElementById('downloadButton-unminify').classList.remove('hidden');
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
            outputElement.classList.add('hidden');
            document.getElementById('downloadButton-unminify').classList.add('hidden');
        } finally {
            submitButton.innerHTML = '<i class="bi bi-check2-circle"></i>';
        }
    };
    reader.readAsText(file);

    function formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        return `${(bytes / Math.pow(1024, Math.floor(Math.log(bytes) / Math.log(1024)))).toFixed(2)} ${units[Math.floor(Math.log(bytes) / Math.log(1024))]}`;
    }
});