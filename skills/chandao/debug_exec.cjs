process.chdir('/opt/data/workspace/projects/skills/skills/chandao');
const { get, handleResponse } = require('./scripts/api.cjs');
const { getToken, httpRaw } = require('./scripts/auth.cjs');
const { loadRequired, API_PATH_PREFIX } = require('./scripts/env.cjs');

(async () => {
  const { baseUrl } = loadRequired();
  const token = await getToken();
  
  // Test /executions
  const execUrl = `${baseUrl}${API_PATH_PREFIX}/executions?pageID=1&recPerPage=1`;
  console.log('Testing:', execUrl);
  const execRes = await httpRaw(execUrl, { method: 'GET', headers: { token } });
  console.log('exec status:', execRes.status);
  console.log('exec data keys:', execRes.data ? Object.keys(execRes.data) : 'null');
  const execHandled = handleResponse(execRes);
  console.log('exec ok:', execHandled.ok);
  console.log('exec data:', JSON.stringify(execHandled.data).slice(0, 200));
})();
