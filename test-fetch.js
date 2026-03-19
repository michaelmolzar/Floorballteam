(async () => {
  try {
    const res = await fetch('https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent('https://www.spielerplus.de/events/ics?t=3CMeB6I-Ep&u=USEzHjb7M2'));
    const text = await res.text();
    const lines = text.split('\n');
    let uid = '';
    let summary = '';
    lines.forEach(l => {
      if (l.startsWith('UID:')) uid = l.trim();
      if (l.startsWith('SUMMARY:')) summary = l.trim();
      if (l.startsWith('END:VEVENT')) {
        console.log(uid, summary);
        uid = ''; summary = '';
      }
    });
  } catch(e) {
    console.error(e);
  }
})();
