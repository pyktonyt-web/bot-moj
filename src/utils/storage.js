const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'database.json');

function getData() {
    try {
        if (!fs.existsSync(filePath)) return {};
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return {};
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {}
}

const storage = {
    get(key) {
        const data = getData();
        return data[key];
    },
    set(key, value) {
        const data = getData();
        data[key] = value;
        saveData(data);
    },
    delete(key) {
        const data = getData();
        delete data[key];
        saveData(data);
    }
};

module.exports = storage;
