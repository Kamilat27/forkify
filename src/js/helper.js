import { TIMEOUT_SEC } from './config';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
export async function AJAX(url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const resp = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await resp.json();
    // console.log(resp);
    // console.log(data);
    if (!resp.ok) throw new Error(`${data.message}: ${resp.status}`);
    return data;
  } catch (error) {
    throw error;
  }
}
