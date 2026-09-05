/**
 * Parameter Sanitizer & HTTP Parameter Pollution (HPP) Defense
 * Normalizes repeated query parameters and enforces safety boundaries on strings
 */
export function parameterSanitizer(req, res, next) {
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      let val = req.query[key];

      // Defend against HTTP Parameter Pollution (e.g. ?search=foo&search=bar)
      if (Array.isArray(val)) {
        val = val[val.length - 1];
        req.query[key] = val;
      }

      if (typeof val === 'string') {
        // Strip null bytes
        val = val.replace(/\0/g, '');

        // Bound search query strings to max 100 characters to prevent ReDoS / query bloat
        if (key === 'search' && val.length > 100) {
          val = val.slice(0, 100);
        }

        req.query[key] = val;
      }
    }
  }

  next();
}
