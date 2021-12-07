function filterPresentOptions(boulders, column, uniqueProperty = "id") {
  if (!boulders || !boulders.length) {
    return [];
  }

  const map = new Map();

  boulders.forEach((boulder) => {
    if (column === "setters" || column === "areas") {
      boulder[column].map((item) => map.set(item.id, item));
    } else {
      map.set(boulder[column][uniqueProperty], boulder[column]);
    }
  });

  return Array.from(map.values());
}

export default filterPresentOptions;
