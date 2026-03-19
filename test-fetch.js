(async () => {
  try {
    const res = await fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent('https://www.spielerplus.de/events/ics?t=3CMeB6I-Ep&u=USEzHjb7M2'));
    console.log(res.status, res.statusText);
    const text = await res.text();
    console.log(text.substring(0, 200));
  } catch(e) {
    console.error(e);
  }
})();
