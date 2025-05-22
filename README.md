# SHA-256 Email Address & Phone Number Hasher (GTM Tag Template)

**Built by [Daniel Perry-Reed](https://datatovalue.com/) @ Data to Value**

This custom GTM tag template allows you to normalize and hash email addresses and phone numbers using SHA-256 and push the results into the `dataLayer`. It supports normalization steps such as trimming, lowercasing, format cleanup, and domain filtering.

---

## 🔧 Features

* Normalise email address (trim, lowercase, remove alias, remove Gmail dots)
* Normalise phone number (optional trimming, strip formatting, enforce E.164 format)
* Blocklist and allowlist domains filtering for email addresses
* SHA-256 hashing for normalised email address and phone number
* All outputs pushed into the `dataLayer` with a configurable event anme
* Optional `user_data` dataLayer object for ad platform integrations
* Configurable debug logging for all steps

---

## 📦 Installation Options

### ✅ Option 1: Import Pre-built JSON

1. Download the `user_data_hasher_container.json` container export [here](./user_data_hasher_container.json)
2. In GTM: go to **Admin > Import Container**.
3. Choose **Merge** and select the target workspace.
4. Click **Confirm** to import everything.

Included in the container is:
* The tag template
* A tag using the template
* Query string variables for `email` and `phone`
* A trigger using the `data_hasher` dataLayer event
* A GA4 event (`user_data`) including the user_data fields for User Provided Data collection (i.e.Eenhanced Conversions)

### 🛠 Option 2: Manual Setup

#### 1. Create Tag Template

* Go to **Templates > Tag Templates > New**
* Paste the full code into the **Code** tab from `./user_data_hasher_template.js` [here](./user_data_hasher_template.js)

#### 2. Add Fields

| Field Type | Name                        | Display Name                       |
| ---------- | --------------------------- | ---------------------------------- |
| Text Input | `emailAddress`              | Email Address                      |
| Checkbox   | `doDecode`                  | Decode URL-encoded input           |
| Checkbox   | `doTrimPhone`               | Trim phone number                  |
| Checkbox   | `doTrim`                    | Trim email                         |
| Checkbox   | `doLowercase`               | Lowercase email                    |
| Checkbox   | `removePlusAlias`           | Remove +alias from email           |
| Checkbox   | `removeDotsInLocalPart`     | Remove dots in Gmail local part    |
| Text Input | `blockedDomains`            | Blocked Domains (comma-separated)  |
| Text Input | `allowedDomains`            | Allowed Domains (comma-separated)  |
| Text Input | `phoneNumber`               | Phone Number                       |
| Checkbox   | `prefixPlusIfMissing`       | Add `+` if missing                 |
| Checkbox   | `stripPhoneFormatting`      | Remove formatting (dashes, spaces) |
| Text Input | `eventName`                 | Event Name                         |
| Checkbox   | `enableDebug`               | Enable Debug Logging               |
| Checkbox   | `includeUserData`           | Include `user_data` object         |
| Checkbox   | `includeUnhashedInUserData` | Include unhashed email/phone       |
| Checkbox   | `includeHashedInUserData`   | Include hashed email/phone         |

#### 3. Set Permissions

* **Logs to Console**
* **Reads/Writes dataLayer**

#### 4. Create Tag Using This Template

* Go to **Tags > New** and select **Tag Configuration > Choose tag type > Tag Templates > \[Your Template Name]**
* Fill in the email and/or phone number fields using GTM Variables or static input
* Enable the normalization and hashing options you need
* Optionally, configure the `eventName`, `user_data` settings, and debugging preferences

#### 5. Add a Trigger

* Click **Triggering > Choose a trigger** to determine when to fire the tag (e.g., Form Submission, Page View, Custom Event)

#### 6. Preview and Test

* Click **Preview** in GTM and follow the steps to open your site in debug mode
* Use the browser's Developer Tools to view `dataLayer` output
* Review any logs shown in the console if debug logging is enabled

---

## 🧪 Example Output

```json
{
  "event": "data_hasher",
  "original_email_address": " Examp.le+123@gmAIL.com",
  "normalised_email_address": "example@gmail.com",
  "hashed_email_address": "abc123...",
  "origianl_phone_number": "(1)23-456-78901 "
  "normalised_phone_number": "+12345678901",
  "hashed_phone_number": "def456...",
  "user_data": {
    "email_address": "example@gmail.com",
    "sha256_email_address": "abc123...",
    "phone_number": "+12345678901",
    "sha256_phone_number": "def456..."
  }
}
```

---

## 📄 License

Apache-2.0. See [LICENSE](./LICENSE).
