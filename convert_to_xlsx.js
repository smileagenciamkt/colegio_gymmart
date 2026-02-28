const fs = require('fs');
// Cargar SheetJS desde el archivo descargado
const xdata = fs.readFileSync('xlsx.js', 'utf8');
const vm = require('vm');
const context = { console, process, require, exports: {}, module: { exports: {} } };
vm.runInNewContext(xdata, context);
const XLSX = context.XLSX || context.module.exports;

try {
    const csvData = fs.readFileSync('alumnos_2do_cientifico.csv', 'utf8');
    const workbook = XLSX.read(csvData, { type: 'string' });
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync('alumnos_2do_cientifico.xlsx', buf);
    console.log('Conversion successful: alumnos_2do_cientifico.xlsx');
} catch (err) {
    console.error('Conversion failed:', err.message);
    process.exit(1);
}
