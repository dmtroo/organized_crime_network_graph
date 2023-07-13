import pako from 'pako';

const countries = ['GB', 'FR', 'IT', 'NL', 'BE'];

async function fetchStatistics(countryCode) {
    let path;

    if(countryCode === 'IT') {
        path = `src/files/${countryCode.toLowerCase()}.json.gz`;
    } else {
        path = `src/files/${countryCode.toLowerCase()}.json`;
    }

    const response = await fetch(path);

    if(path.endsWith('.gz')) {
        const buffer = await response.arrayBuffer();
        const jsonString = pako.inflate(buffer, { to: 'string' });
        return JSON.parse(jsonString).statistics;
    } else {
        const data = await response.json();
        return data.statistics;
    }
}

export async function loadStatistics() {
    const statsPromises = countries.map(country => fetchStatistics(country));
    const statsArray = await Promise.all(statsPromises);

    const stats = statsArray.reduce((acc, currentStats, index) => {
        acc[countries[index]] = currentStats;
        return acc;
    }, {});

    const allKeys = new Set();
    Object.values(stats).forEach(countryStats => {
        Object.keys(countryStats).forEach(key => allKeys.add(key));
    });

    return { statistics: stats, allKeys: Array.from(allKeys) };
}
