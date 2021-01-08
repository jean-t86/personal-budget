const getRandomElement = (arr) => {
  if (!Array.isArray(arr)) throw new Error('Expected an array');
  return arr[Math.floor(Math.random() * arr.length)];
};

const getElementById = (arr, id) => arr.find((val) => val.id === id);

const getIndexById = (arr, id) => arr.findIndex((val) => val.id === id);

const getNewId = (arr) => {
  const maxId = arr.reduce((acc, nextVal) => {
    return acc = Math.max(acc, nextVal.id);
  }, 0);
  return maxId + 1;
};

module.exports = {
  getRandomElement,
  getElementById,
  getIndexById,
  getNewId,
};
