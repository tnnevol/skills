const { get } = require('./scripts/api.cjs');
(async () => {
  const res = await get('/tasks', { recPerPage: 20, pageID: 1 });
  console.log('ok:', res.ok);
  console.log('error:', res.error);
  console.log('data keys:', res.data ? Object.keys(res.data) : 'null');
  console.log('data:', JSON.stringify(res.data).slice(0, 300));
})();
