/**
 * Zeus Daily — Push Notification Sender
 *
 * Usage:  node notify.js [vol] [title]
 * Example: node notify.js 011 "The Quantum Mirage"
 *
 * If no args, fetches the latest edition from Supabase automatically.
 */

var webpush = require('web-push');

// ── Config ──
var SUPA_URL = 'https://ruuksrwlgsenkkkkapbu.supabase.co';
var SUPA_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dWtzcndsZ3Nlbmtra2thcGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNzcyOSwiZXhwIjoyMDg4ODAzNzI5fQ.GQMJ4NBQkcckF6HL96sFn1DCeZ-2dPXim98K_h82vds';

var VAPID_PUBLIC  = 'BICd_N0vIavvCF2kjEkZERc2a33K-255cAvPokovJgElGmE_hJJQI0D_10HSyKdaVgcMFcc-0QpyiQs_Xbfiz4Y';
var VAPID_PRIVATE = 'lG6-IvMB1iGfPyfLS31ktOtQ9ZSWI_yln5OLRhjHYGA';

webpush.setVapidDetails('mailto:zeus@zeusdaily.blog', VAPID_PUBLIC, VAPID_PRIVATE);

function supaFetch(path) {
  return fetch(SUPA_URL + '/rest/v1/' + path, {
    headers: {
      'apikey': SUPA_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPA_SERVICE_KEY
    }
  }).then(function(r) { return r.json(); });
}

function supaDelete(path) {
  return fetch(SUPA_URL + '/rest/v1/' + path, {
    method: 'DELETE',
    headers: {
      'apikey': SUPA_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPA_SERVICE_KEY
    }
  });
}

async function main() {
  var vol = process.argv[2] || null;
  var title = process.argv[3] || null;

  // If no args, fetch latest edition
  if (!vol || !title) {
    var editions = await supaFetch('editions?select=vol_number,title,title_en,html_url&order=vol_number.desc&limit=1');
    if (!editions || !editions.length) {
      console.log('No editions found.');
      return;
    }
    var latest = editions[0];
    vol = String(latest.vol_number).padStart(3, '0');
    title = latest.title;
  }

  console.log('Sending push for Vol.' + vol + ': ' + title);

  // Fetch all subscriptions
  var subs = await supaFetch('push_subscriptions?select=*');
  if (!subs || !subs.length) {
    console.log('No push subscribers found.');
    return;
  }

  console.log('Found ' + subs.length + ' subscriber(s)');

  var payload = JSON.stringify({
    title: 'Zeus Daily · Vol.' + vol,
    body: title,
    url: '/dashboard'
  });

  var sent = 0;
  var failed = 0;

  for (var i = 0; i < subs.length; i++) {
    var sub = subs[i];
    var pushSub = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys_p256dh,
        auth: sub.keys_auth
      }
    };

    try {
      await webpush.sendNotification(pushSub, payload);
      sent++;
    } catch (err) {
      failed++;
      console.log('Failed: ' + sub.endpoint.slice(0, 60) + '... (' + (err.statusCode || err.message) + ')');
      // Remove expired/invalid subscriptions (410 Gone or 404)
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supaDelete('push_subscriptions?id=eq.' + sub.id);
        console.log('  -> Removed expired subscription');
      }
    }
  }

  console.log('Done: ' + sent + ' sent, ' + failed + ' failed');
}

main().catch(function(e) { console.error(e); process.exit(1); });
