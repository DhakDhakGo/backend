const { doc, getDoc, query, orderBy, startAfter, where, limit } = require("@firebase/firestore");

const createSearchCriteria = (query) => {
  let criteria = {};
  Object.entries(query).forEach(([key, value]) => {
    if (!value) return;
    const regex = /"([^"]*)"|([^, ]+)/g;
    const matches = [...value.matchAll(regex)];
    if (matches.length > 1) {
      criteria[key] = matches.map((m) => (m[1] || m[2]).trim());
    } else {
      criteria[key] = (matches[0][1] || matches[0][2]).trim();
    }
  });
  return criteria;
};

const createQueryBasedOnCriteria = async (criteria, collectionRef) => {
  let { orderBy: orderByField, direction, limit: limitValue, lastDocId, ...others } = criteria;
  if (!orderByField) {
    orderByField = 'createdAt';
    direction = 'desc';
  }
  if (!limitValue) {
    limitValue = 20;
  }
  
  // Start with collection reference
  let q = collectionRef;
  
  // Add where constraints
  Object.entries(others).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      q = query(q, where(key, 'in', value));
    } else {
      q = query(q, where(key, '==', value));
    }
  });
  
  // Add orderBy
  q = query(q, orderBy(orderByField, direction));

  // Add pagination if needed
  if (lastDocId) {
    const lastDocRef = doc(collectionRef, lastDocId);
    const lastDoc = await getDoc(lastDocRef);
    if (lastDoc?.exists()) {
      q = query(q, startAfter(lastDoc));
    }
  }

  // Add limit at the end
  q = query(q, limit(limitValue));
  return q;
};

module.exports = {
  createSearchCriteria,
  createQueryBasedOnCriteria
};
