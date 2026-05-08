/**
 * travelmap-search-bridge.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop this script into travelmap.html AFTER all data scripts have loaded.
 * It reads whatever travel data variables exist on the page and registers
 * them under window.__siteSearchData.travelmap so that search.js can index
 * every destination, country, city, and activity without needing to know
 * the exact variable names used in the travelmap app.
 *
 * HOW TO ADD TO travelmap.html:
 *   Add this line near the bottom of <body>, after travelmap_data.js loads:
 *   <script src="static/js/travelmap-search-bridge.js"></script>
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  // ── 1. Known variable names used by common travelmap implementations ───────
  //    Add any new variable name here if you rename your data file.
  var CANDIDATE_VARS = [
    // Most likely names based on the page structure we can see:
    'travelData', 'travelmap', 'travelmapData', 'mapData', 'stampData',
    'stamps', 'destinations', 'countries', 'visits', 'trips', 'places',
    'locations', 'markers', 'pins', 'waypoints', 'spots',
    'placesData', 'countriesData', 'citiesData', 'visitedData',
    'travelEntries', 'travelLog', 'journeys', 'voyages',
    // Specific to Leaflet-based maps:
    'geojsonData', 'featureData', 'geoData',
    // Activity-style data (travelmap has an "Activities" filter):
    'activities', 'activityData', 'travelActivities',
  ];

  // ── 2. Heuristic: scan ALL globals for arrays of place-like objects ────────
  function looksLikePlace(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    // Must have a name/title AND some location indicator
    var hasName = 'name' in obj || 'title' in obj || 'place' in obj ||
                  'city' in obj || 'country' in obj || 'destination' in obj ||
                  'label' in obj || 'stamp' in obj;
    var hasLoc  = 'lat' in obj || 'lng' in obj || 'latitude' in obj ||
                  'longitude' in obj || 'country' in obj || 'iso' in obj ||
                  'iso2' in obj || 'iso3' in obj || 'coords' in obj ||
                  'latlng' in obj || 'position' in obj;
    return hasName && hasLoc;
  }

  function collectArrays() {
    var found = [];
    var seen  = new Set();

    // First check named candidates
    CANDIDATE_VARS.forEach(function (v) {
      try {
        var val = window[v];
        if (Array.isArray(val) && val.length > 0 && !seen.has(v)) {
          seen.add(v);
          found.push({ key: v, data: val });
        }
      } catch (e) {}
    });

    // Then scan all globals
    var SKIP = new Set(['INDEX', 'PAGES', 'history', 'location', 'performance',
                        'navigator', 'document', 'window', 'self', 'top',
                        'frames', 'parent', 'opener', 'screen', 'crypto']);
    try {
      Object.keys(window).forEach(function (key) {
        if (seen.has(key) || SKIP.has(key)) return;
        if (key.startsWith('_') || key.startsWith('webkit') || key.startsWith('on')) return;
        try {
          var val = window[key];
          if (!Array.isArray(val) || val.length === 0) return;
          if (looksLikePlace(val[0])) {
            seen.add(key);
            found.push({ key: key, data: val });
          }
        } catch (e2) {}
      });
    } catch (e) {}

    return found;
  }

  // ── 3. Normalise each entry to a common shape ─────────────────────────────
  function normalise(entry) {
    // Support nested coords: { coords: [lat, lng] } or { latlng: {lat, lng} }
    var lat = entry.lat || entry.latitude || (entry.coords && entry.coords[0]) ||
              (entry.latlng && entry.latlng.lat) || (entry.position && entry.position.lat) || null;
    var lng = entry.lng || entry.lon || entry.longitude || (entry.coords && entry.coords[1]) ||
              (entry.latlng && entry.latlng.lng) || (entry.position && entry.position.lng) || null;

    return {
      name:        entry.name || entry.title || entry.place || entry.city ||
                   entry.destination || entry.label || entry.stamp || '',
      country:     entry.country || entry.nation || entry.countryName || '',
      city:        entry.city || entry.town || entry.municipality || '',
      region:      entry.region || entry.province || entry.state || entry.area || entry.district || '',
      continent:   entry.continent || '',
      iso:         entry.iso || entry.iso2 || entry.iso3 || entry.countryCode || '',
      date:        entry.date || entry.year || entry.visited || entry.when || entry.period || '',
      description: entry.description || entry.desc || entry.notes || entry.caption ||
                   entry.summary || entry.info || entry.details || '',
      type:        entry.type || entry.category || entry.kind || entry.activityType || '',
      tags:        Array.isArray(entry.tags) ? entry.tags.join(', ') : (entry.tags || ''),
      url:         entry.url || entry.href || entry.link || '',
      lat:         lat,
      lng:         lng,
      // keep the raw entry too so nothing is lost
      _raw:        entry,
    };
  }

  // ── 4. Register into window.__siteSearchData ──────────────────────────────
  function register() {
    window.__siteSearchData = window.__siteSearchData || {};

    var arrays = collectArrays();
    if (!arrays.length) return;

    var normalised = [];
    arrays.forEach(function (arr) {
      arr.data.forEach(function (entry) {
        try { normalised.push(normalise(entry)); } catch (e) {}
      });
    });

    window.__siteSearchData.travelmap = normalised;

    // Also expose the raw arrays under their original keys for compatibility
    arrays.forEach(function (arr) {
      window.__siteSearchData['_raw_' + arr.key] = arr.data;
    });

    // Dispatch a custom event so search.js can react if it is already loaded
    try {
      window.dispatchEvent(new CustomEvent('siteSearchDataReady', {
        detail: { source: 'travelmap', count: normalised.length }
      }));
    } catch (e) {}
  }

  // Run after DOM + scripts are fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', register);
  } else {
    // DOMContentLoaded already fired — but data scripts may still be loading.
    // Use a short rAF chain to wait one more tick.
    requestAnimationFrame(function () { requestAnimationFrame(register); });
  }
})();
