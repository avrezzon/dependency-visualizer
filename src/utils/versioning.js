export const bumpString = (ver, type) => {
    const [major, minor, patch] = ver.split('.').map(Number);
    if (type === 'major') return `${major + 1}.0.0`;
    if (type === 'minor') return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
};
