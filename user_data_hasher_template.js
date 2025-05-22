/*
Built by Daniel Perry-Reed @ Data to Value
https://datatovalue.com/
*/

var sha256 = require('sha256');
var decodeUriComponent = require('decodeUriComponent');
var getType = require('getType');
var log = require('logToConsole');
var createQueue = require('createQueue');
var dataLayerPush = createQueue('dataLayer');

var logEmail = '📧 [Email] ';
var logPhone = '📞 [Phone] ';

// === EMAIL LOGIC ===

var originalEmail = data.emailAddress;
if (getType(originalEmail) === 'string') {
  var firstChar = originalEmail.charAt(0);
  var lastChar = originalEmail.charAt(originalEmail.length - 1);
  var hasLeading = firstChar === ' ';
  var hasTrailing = lastChar === ' ';
  var parts = originalEmail.trim().split(' ');
  originalEmail = (hasLeading ? ' ' : '') + parts.join('+') + (hasTrailing ? ' ' : '');
  if (data.enableDebug) log(logEmail + 'Recovered + from spaces: ' + originalEmail);
} else {
  originalEmail = undefined;
}

var email = originalEmail;

if (email && data.doDecode) {
  email = decodeUriComponent(email);
  if (data.enableDebug) log(logEmail + 'Decoded: ' + email);
}

if (email) {
  email = email.trim();
  if (data.enableDebug) log(logEmail + 'Trimmed: ' + email);
}
if (email && data.doLowercase) {
  email = email.toLowerCase();
  if (data.enableDebug) log(logEmail + 'Lowercased: ' + email);
}

var emailValid = false;
if (email && email.indexOf('@') > -1) {
  var atIndex = email.indexOf('@');
  var local = email.substring(0, atIndex);
  var domain = email.substring(atIndex + 1);

  if (data.removePlusAlias) {
    var plusIndex = local.indexOf('+');
    if (plusIndex > -1) {
      local = local.substring(0, plusIndex);
      if (data.enableDebug) log(logEmail + 'Removed alias: ' + local + '@' + domain);
    }
  }

  if (data.removeDotsInLocalPart && domain === 'gmail.com') {
    local = local.split('.').join('');
    if (data.enableDebug) log(logEmail + 'Removed Gmail dots: ' + local + '@' + domain);
  }

  if (data.blockedDomains) {
    var blocked = data.blockedDomains.split(',');
    if (blocked.map(function(b) { return b.trim().toLowerCase(); }).indexOf(domain) > -1) {
      if (data.enableDebug) log(logEmail + 'Blocked domain: ' + domain);
      email = undefined;
    }
  }

  if (email && data.allowedDomains) {
    var allowed = data.allowedDomains.split(',');
    var match = false;
    for (var a = 0; a < allowed.length; a++) {
      if (domain === allowed[a].trim().toLowerCase()) {
        match = true;
        break;
      }
    }
    if (!match) {
      if (data.enableDebug) log(logEmail + 'Not on allowlist: ' + domain);
      email = undefined;
    }
  }

  if (email) {
    email = local + '@' + domain;
    emailValid = true;
    if (data.enableDebug) log(logEmail + 'Final normalized: ' + email);
  }
}

// === PHONE LOGIC ===

var originalPhone = data.phoneNumber;
var phone = originalPhone;
var phoneValid = false;

if (getType(phone) === 'string') {
  if (data.doTrimPhone) {
    phone = phone.trim();
    if (data.enableDebug) log(logPhone + 'Trimmed input: ' + phone);
  }

  if (data.prefixPlusIfMissing && phone.charAt(0) !== '+') {
    phone = '+' + phone;
    if (data.enableDebug) log(logPhone + 'Added + prefix: ' + phone);
  }

  if (data.stripPhoneFormatting) {
    var digitsOnly = '';
    for (var i = 0; i < phone.length; i++) {
      var ch = phone.charAt(i);
      if ((ch >= '0' && ch <= '9') || (i === 0 && ch === '+')) {
        digitsOnly += ch;
      }
    }
    phone = digitsOnly;
    if (data.enableDebug) log(logPhone + 'Stripped formatting: ' + phone);
  }

  var isValidE164 = phone.charAt(0) === '+' && phone.length >= 11 && phone.length <= 16;
  var allDigits = true;
  for (var j = 1; j < phone.length; j++) {
    var pj = phone.charAt(j);
    if (pj < '0' || pj > '9') {
      allDigits = false;
      break;
    }
  }
  if (isValidE164 && allDigits) {
    phoneValid = true;
    if (data.enableDebug) log(logPhone + 'Valid E.164: ' + phone);
  } else {
    if (data.enableDebug) log(logPhone + 'Invalid E.164 format: ' + phone);
    phone = undefined;
  }
} else {
  phone = undefined;
}

// === ASYNC HASH + DATALAYER ===

var eventName = data.eventName && data.eventName.length > 0 ? data.eventName : 'data_hasher';
var emailHash = '';
var phoneHash = '';

function done() {
  if (data.enableDebug && emailValid) log(logEmail + 'SHA-256: ' + emailHash);
  if (data.enableDebug && phoneValid) log(logPhone + 'SHA-256: ' + phoneHash);

  var payload = {
    'event': eventName
  };

  if (emailValid) {
    payload.original_email_address = originalEmail;
    payload.normalised_email_address = email;
    payload.hashed_email_address = emailHash;
  }

  if (phoneValid) {
    payload.original_phone_number = originalPhone;
    payload.normalised_phone_number = phone;
    payload.hashed_phone_number = phoneHash;
  }

  if (data.includeUserData && (data.includeUnhashedInUserData || data.includeHashedInUserData)) {
    var user_data = {};
    if (data.includeUnhashedInUserData && emailValid) user_data.email_address = email;
    if (data.includeHashedInUserData && emailValid) user_data.sha256_email_address = emailHash;
    if (data.includeUnhashedInUserData && phoneValid) user_data.phone_number = phone;
    if (data.includeHashedInUserData && phoneValid) user_data.sha256_phone_number = phoneHash;
    payload.user_data = user_data;
  }

  dataLayerPush(payload);
  data.gtmOnSuccess();
}

function hashIfPresent(value, cb) {
  if (value && getType(value) === 'string') {
    sha256(value, function (hash) { cb(hash); }, function () { cb(''); }, { outputEncoding: 'hex' });
  } else {
    cb('');
  }
}

var pending = 2;

hashIfPresent(email, function (hash) {
  emailHash = hash;
  pending--;
  if (pending === 0) done();
});

hashIfPresent(phone, function (hash) {
  phoneHash = hash;
  pending--;
  if (pending === 0) done();
});
