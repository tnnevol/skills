process.chdir('/opt/data/workspace/projects/skills/skills/chandao');
const { get } = require('./scripts/api.cjs');

(async () => {
  const res = await get('/tasks', { recPerPage: 20, pageID: 1 });
  console.log('res.ok:', res.ok);
  console.log('res.error:', res.error);
  
  const hasNoFilter = true; // no project/execution/assignedTo
  const isEmptyResult = !res.ok ||
    (res.ok && res.data && !res.data.tasks &&
     (!res.data.result || (typeof res.data.result === 'object' &&
       !Object.values(res.data.result).some(v => Array.isArray(v) && v.length > 0))));
  
  console.log('hasNoFilter:', hasNoFilter);
  console.log('isEmptyResult:', isEmptyResult);
  console.log('Will fallback:', isEmptyResult && hasNoFilter);
  
  if (isEmptyResult && hasNoFilter) {
    console.log('Attempting fallback...');
    try {
      const execRes = await get('/executions', { recPerPage: 1, pageID: 1 });
      console.log('execRes.ok:', execRes.ok);
      console.log('execRes.data keys:', execRes.data ? Object.keys(execRes.data) : 'null');
      if (execRes.ok) {
        const items = execRes.data.executions || execRes.data.data || [];
        console.log('items:', items.length);
        if (items.length > 0) {
          const execId = items[0].id;
          console.log('execId:', execId);
          const taskRes = await get('/tasks', { recPerPage: 20, pageID: 1, execution: execId });
          console.log('taskRes.ok:', taskRes.ok);
          if (taskRes.ok) {
            console.log('taskRes.data keys:', Object.keys(taskRes.data));
          }
        }
      }
    } catch (e) {
      console.log('Fallback error:', e.message);
    }
  }
})();
