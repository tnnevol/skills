//! Utility functions.
use serde_json::Value;

/// Safely extract a string from a JSON Value.
pub fn get_str(data: &Value, key: &str) -> String {
    data.get(key).and_then(|v| v.as_str()).unwrap_or("").to_string()
}

/// Safely extract an object from a JSON Value.
pub fn get_obj<'a>(data: &'a Value, key: &str) -> Option<&'a Value> {
    data.get(key).filter(|v| v.is_object())
}

/// Safely extract a f64 from a JSON Value.
pub fn get_f64(data: &Value, key: &str) -> f64 {
    data.get(key).and_then(|v| v.as_f64()).unwrap_or(0.0)
}

/// Convert a title to a URL-friendly slug.
pub fn slugify(text: &str) -> String {
    let s = text.to_lowercase().trim().to_string();
    // Replace non-alphanumeric chars with hyphens
    let slug: String = s
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() { c } else { '-' })
        .collect();
    // Collapse multiple hyphens
    let mut result = slug.replace("--", "-");
    while result.contains("--") {
        result = result.replace("--", "-");
    }
    let result = result.trim_matches('-').to_string();
    if result.is_empty() {
        format!("post-{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs())
    } else {
        result
    }
}

/// Format an ISO 8601 timestamp to readable Chinese format.
pub fn format_time(iso_str: &str) -> String {
    if iso_str.is_empty() {
        return String::new();
    }
    // Try parsing RFC3339
    if let Ok(dt) = chrono_parse(iso_str) {
        return format!("{}", dt);
    }
    iso_str.to_string()
}

/// Parse ISO 8601 timestamp to local time string (no external crate dependency).
fn chrono_parse(s: &str) -> Result<String, ()> {
    // Simple parsing: extract date parts and format
    // Format: 2026-04-16T10:23:00Z or 2026-04-16T10:23:00.000Z
    let s = s.trim();
    let date_part = s.split('T').next().ok_or(())?;
    let time_part = s.split('T').nth(1).ok_or(())?;
    let time_part = time_part.split('.').next().unwrap_or(time_part);
    let time_part = time_part.trim_end_matches('Z');

    let parts: Vec<&str> = date_part.split('-').collect();
    if parts.len() != 3 {
        return Err(());
    }

    // Parse time parts
    let tparts: Vec<&str> = time_part.split(':').collect();
    let hour = tparts.first().map(|s| s.parse::<i32>().unwrap_or(0)).unwrap_or(0);
    let min = tparts.get(1).map(|s| s.parse::<i32>().unwrap_or(0)).unwrap_or(0);

    // Convert UTC to Asia/Shanghai (UTC+8)
    let hour_cst = hour + 8;
    let day_extra = hour_cst / 24;
    let hour_cst = hour_cst % 24;

    let year: i32 = parts[0].parse().map_err(|_| ())?;
    let month: i32 = parts[1].parse().map_err(|_| ())?;
    let day: i32 = parts[2].parse().map_err(|_| ())?;

    // Simple day overflow handling (good enough for display)
    let day = day + day_extra;

    Ok(format!("{:04}-{:02}-{:02} {:02}:{:02}", year, month, day, hour_cst, min))
}

/// Build post public URL.
pub fn build_post_link(base_url: &str, post: &Value) -> String {
    let base = base_url.trim_end_matches('/');

    // Try spec.slug first
    if let Some(spec) = get_obj(post, "spec") {
        let slug = get_str(spec, "slug");
        if !slug.is_empty() {
            return format!("{}/archives/{}", base, url_encode(&slug));
        }
    }

    // Fallback to metadata.name
    if let Some(meta) = get_obj(post, "metadata") {
        let name = get_str(meta, "name");
        if !name.is_empty() {
            return format!("{}/archives/{}", base, url_encode(&name));
        }
    }

    base.to_string()
}

/// Simple URL encoding for slug strings.
fn url_encode(s: &str) -> String {
    s.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.' | '~') {
                c.to_string()
            } else {
                format!("%{:02X}", c as u8)
            }
        })
        .collect()
}
